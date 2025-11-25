import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { paymentService } from '../services/payment';
import { supabase } from '../utils/supabaseClient';
import '../styles/SubscriptionsPage.css';

const CheckoutSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUserProfile } = useAuth();
    const { showSuccess } = useNotification();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (sessionId) {
            const processCheckout = async () => {
                // Processar sucesso do checkout
                await paymentService.handleCheckoutSuccess(sessionId);

                // Aguardar atualização do tier (webhook pode demorar alguns segundos)
                let attempts = 0;
                const maxAttempts = 10;
                const checkInterval = 1000; // 1 segundo

                const checkTierUpdate = async (): Promise<boolean> => {
                    await refreshUserProfile(true); // Forçar refresh

                    // Verificar se o tier foi atualizado
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: profile } = await supabase
                            .from('users')
                            .select('tier')
                            .eq('id', user.id)
                            .single();

                        return profile?.tier === 'premium';
                    }
                    return false;
                };

                // Tentar verificar atualização do tier com retry
                while (attempts < maxAttempts) {
                    const isPremium = await checkTierUpdate();

                    if (isPremium) {
                        // Tier atualizado com sucesso
                        showSuccess(
                            'Pagamento confirmado!',
                            'Sua assinatura Premium foi ativada com sucesso'
                        );
                        break;
                    }

                    attempts++;
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, checkInterval));
                    }
                }

                // Se não conseguiu atualizar após todas as tentativas, mostrar mensagem mesmo assim
                if (attempts >= maxAttempts) {
                    showSuccess(
                        'Pagamento confirmado!',
                        'Sua assinatura está sendo processada. Atualize a página em alguns instantes.'
                    );
                }
            };

            processCheckout();
        }
    }, [searchParams, refreshUserProfile, showSuccess]);

    return (
        <div className="subscriptions-page">
            <Sidebar />
            <div className="subscriptions-main-content">
                <Header />
                <div className="subscriptions-container">
                    <div className="checkout-success">
                        <div className="success-icon">✓</div>
                        <h1>Pagamento Confirmado!</h1>
                        <p className="success-message">
                            Parabéns! Sua assinatura Premium foi ativada com sucesso.
                        </p>
                        <div className="success-details">
                            <h3>O que você ganhou:</h3>
                            <ul>
                                <li>✓ Acesso a todo conteúdo exclusivo</li>
                                <li>✓ Membros ilimitados</li>
                                <li>✓ Análises avançadas</li>
                                <li>✓ Pagamentos prioritários</li>
                                <li>✓ Suporte premium</li>
                            </ul>
                        </div>
                        <div className="success-actions">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="pricing-btn primary"
                            >
                                Ir para Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/settings?section=subscriptions')}
                                className="pricing-btn"
                            >
                                Gerenciar Assinatura
                            </button>
                        </div>
                    </div>
                </div>
                <MobileBottomBar />
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
