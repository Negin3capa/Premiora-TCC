/**
 * Utilitário compartilhado para configuração do Stripe
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

/**
 * Inicializa cliente Stripe com configurações padrão
 */
export function initializeStripe(): Stripe {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurado');
    }

    return new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
    });
}

/**
 * Verifica assinatura de webhook do Stripe
 */
export function verifyWebhookSignature(
    body: string,
    signature: string,
    stripe: Stripe
): Stripe.Event {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
    }

    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
