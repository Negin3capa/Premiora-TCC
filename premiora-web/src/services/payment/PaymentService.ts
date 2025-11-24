import { supabase } from "../../utils/supabaseClient";
import type {
    CreateCheckoutSessionRequest,
    CreateCheckoutSessionResponse,
} from "../../types/payment";

/**
 * Serviço para gerenciar operações de pagamento com Stripe
 */
class PaymentService {
    /**
     * Cria uma sessão de checkout do Stripe
     * @param priceId ID do preço do Stripe
     * @returns URL da sessão de checkout
     */
    async createCheckoutSession(priceId: string): Promise<string> {
        try {
            // Obter sessão do usuário autenticado
            const { data: { session }, error: sessionError } = await supabase
                .auth.getSession();

            if (sessionError || !session) {
                throw new Error("Usuário não autenticado");
            }

            // Construir URLs de sucesso e cancelamento
            const baseUrl = window.location.origin;
            const successUrl =
                `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${baseUrl}/checkout/cancel`;

            // Preparar request
            const request: CreateCheckoutSessionRequest = {
                priceId,
                successUrl,
                cancelUrl,
            };

            // Chamar Edge Function para criar sessão
            const { data, error } = await supabase.functions.invoke<
                CreateCheckoutSessionResponse
            >(
                "create-checkout-session",
                {
                    body: request,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                },
            );

            if (error) {
                console.error("Erro ao criar sessão de checkout:", error);
                throw new Error(
                    error.message || "Erro ao criar sessão de checkout",
                );
            }

            if (!data || !data.url) {
                throw new Error("Resposta inválida do servidor");
            }

            return data.url;
        } catch (error) {
            console.error(
                "Erro no PaymentService.createCheckoutSession:",
                error,
            );
            throw error;
        }
    }

    /**
     * Redireciona o usuário para a página de checkout do Stripe
     * @param checkoutUrl URL da sessão de checkout
     */
    redirectToCheckout(checkoutUrl: string): void {
        window.location.href = checkoutUrl;
    }

    /**
     * Processa o retorno bem-sucedido do checkout
     * @param sessionId ID da sessão de checkout
     */
    async handleCheckoutSuccess(sessionId: string): Promise<void> {
        try {
            // Aqui podemos adicionar lógica adicional se necessário
            // Por exemplo, verificar o status da sessão ou atualizar cache local
            console.log("Checkout bem-sucedido, session ID:", sessionId);

            // Recarregar perfil do usuário para obter tier atualizado
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Forçar refresh do perfil
                await supabase
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();
            }
        } catch (error) {
            console.error("Erro ao processar sucesso do checkout:", error);
        }
    }

    /**
     * Processa o cancelamento do checkout
     */
    handleCheckoutCancel(): void {
        console.log("Checkout cancelado pelo usuário");
    }

    /**
     * Cria uma conta Connect para o criador
     * @returns URL de onboarding do Stripe Connect
     */
    async createConnectAccount(): Promise<string> {
        try {
            const { data: { session }, error: sessionError } = await supabase
                .auth.getSession();

            if (sessionError || !session) {
                throw new Error("Usuário não autenticado");
            }

            const baseUrl = window.location.origin;
            const returnUrl =
                `${baseUrl}/profile?tab=creator&section=payments&status=return`;
            const refreshUrl =
                `${baseUrl}/profile?tab=creator&section=payments&status=refresh`;

            const { data, error } = await supabase.functions.invoke<
                { url: string }
            >(
                "create-connect-account",
                {
                    body: { returnUrl, refreshUrl },
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                },
            );

            if (error) {
                console.error("Erro ao criar conta Connect:", error);
                throw new Error(error.message || "Erro ao criar conta Connect");
            }

            if (!data || !data.url) {
                throw new Error("Resposta inválida do servidor");
            }

            return data.url;
        } catch (error) {
            console.error(
                "Erro no PaymentService.createConnectAccount:",
                error,
            );
            throw error;
        }
    }

    /**
     * Verifica se o usuário já tem assinatura premium
     * @returns true se o usuário é premium
     */
    async isPremiumUser(): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return false;
            }

            const { data: profile } = await supabase
                .from("users")
                .select("tier")
                .eq("id", user.id)
                .single();

            return profile?.tier === "premium";
        } catch (error) {
            console.error("Erro ao verificar status premium:", error);
            return false;
        }
    }
}

// Exportar instância singleton
export const paymentService = new PaymentService();
export default paymentService;
