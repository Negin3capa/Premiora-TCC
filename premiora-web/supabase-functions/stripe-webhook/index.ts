import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

// Configuração de CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

/**
 * Edge Function: Stripe Webhook
 * 
 * Processa eventos de webhook do Stripe, especialmente checkout.session.completed
 */
serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Obter variáveis de ambiente
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

        if (!stripeSecretKey || !webhookSecret) {
            console.error('Variáveis de ambiente Stripe não configuradas');
            return new Response(
                JSON.stringify({ error: 'Configuração do servidor inválida' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Inicializar Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Obter assinatura do webhook
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            console.error('Assinatura do webhook ausente');
            return new Response(
                JSON.stringify({ error: 'Assinatura do webhook ausente' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Obter body como texto
        const body = await req.text();

        // Verificar assinatura do webhook
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Erro ao verificar assinatura do webhook:', err.message);
            return new Response(
                JSON.stringify({ error: `Webhook Error: ${err.message}` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Evento recebido: ${event.type}`);

        // Processar evento checkout.session.completed
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(`Processando checkout.session.completed: ${session.id}`);

            // Extrair metadata
            const userId = session.metadata?.user_id;
            const tier = session.metadata?.tier || 'premium';

            if (!userId) {
                console.error('user_id não encontrado na metadata da sessão');
                return new Response(
                    JSON.stringify({ error: 'Metadata inválida' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Atualizar tier do usuário no Supabase
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseServiceKey,
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({ tier }),
                }
            );

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error(`Erro ao atualizar tier do usuário: ${errorText}`);
                return new Response(
                    JSON.stringify({ error: 'Erro ao atualizar tier do usuário' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            console.log(`Tier do usuário ${userId} atualizado para ${tier}`);

            // Criar registro na tabela subscriptions (se existir)
            const subscription = session.subscription as string;
            const customerId = session.customer as string;

            if (subscription && customerId) {
                const subscriptionData = {
                    user_id: userId,
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscription,
                    stripe_price_id: session.line_items?.data[0]?.price?.id || '',
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
                };

                const subscriptionResponse = await fetch(
                    `${supabaseUrl}/rest/v1/subscriptions`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation',
                        },
                        body: JSON.stringify(subscriptionData),
                    }
                );

                if (subscriptionResponse.ok) {
                    console.log(`Registro de assinatura criado para usuário ${userId}`);
                } else {
                    // Não falhar se a tabela subscriptions não existir
                    console.warn('Não foi possível criar registro de assinatura (tabela pode não existir)');
                }
            }
        }

        // Retornar sucesso
        return new Response(
            JSON.stringify({ received: true }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return new Response(
            JSON.stringify({
                error: 'Erro ao processar webhook',
                details: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
