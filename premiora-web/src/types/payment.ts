/**
 * Tipos relacionados a pagamentos e assinaturas Stripe
 */

/**
 * Sessão de checkout do Stripe
 */
export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Status possíveis de uma assinatura
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

/**
 * Assinatura do usuário
 */
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request para criar sessão de checkout
 */
export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Response da criação de sessão de checkout
 */
export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Erro de pagamento
 */
export interface PaymentError {
  code: string;
  message: string;
  details?: string;
}
