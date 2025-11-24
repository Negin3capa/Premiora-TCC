import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { paymentService } from '../services/payment';
import '../styles/SubscriptionsPage.css';

const CheckoutSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUserProfile } = useAuth();
    const { showSuccess } = useNotification();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (sessionId) {
            // Processar sucesso do checkout
            paymentService.handleCheckoutSuccess(sessionId);

            // Atualizar perfil do usuário
            refreshUserProfile();

            // Mostrar notificação de sucesso
            showSuccess(
                'Pagamento confirmado!',
                'Sua assinatura Premium foi ativada com sucesso'
            );
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
                                onClick={() => navigate('/settings')}
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
