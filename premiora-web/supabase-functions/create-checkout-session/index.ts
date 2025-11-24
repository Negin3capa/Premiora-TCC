import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

// Configuração de CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function: Create Checkout Session
 * 
 * Cria uma sessão de checkout do Stripe para assinatura Premium
 */
serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Verificar autenticação
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Não autorizado' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Obter variáveis de ambiente
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            console.error('STRIPE_SECRET_KEY não configurado');
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

        // Parse do body
        const { priceId, successUrl, cancelUrl } = await req.json();

        if (!priceId || !successUrl || !cancelUrl) {
            return new Response(
                JSON.stringify({ error: 'Parâmetros inválidos' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Extrair user ID do token JWT (simplificado - em produção usar biblioteca JWT)
        const token = authHeader.replace('Bearer ', '');

        // Criar cliente Supabase para verificar usuário
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabaseResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': authHeader,
                'apikey': supabaseServiceKey,
            },
        });

        if (!supabaseResponse.ok) {
            return new Response(
                JSON.stringify({ error: 'Usuário não autenticado' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const user = await supabaseResponse.json();
        const userId = user.id;

        // Verificar se usuário já é premium
        const userCheckResponse = await fetch(
            `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=tier`,
            {
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                },
            }
        );

        const userData = await userCheckResponse.json();
        if (userData && userData[0]?.tier === 'premium') {
            return new Response(
                JSON.stringify({ error: 'Usuário já possui assinatura premium' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                user_id: userId,
                tier: 'premium',
            },
            customer_email: user.email,
        });

        console.log(`Sessão de checkout criada: ${session.id} para usuário ${userId}`);

        return new Response(
            JSON.stringify({
                sessionId: session.id,
                url: session.url,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );

    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        return new Response(
            JSON.stringify({
                error: 'Erro ao criar sessão de checkout',
                details: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
