import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { paymentService } from '../services/payment';
import '../styles/SubscriptionsPage.css';

const CheckoutCancelPage: React.FC = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        // Processar cancelamento
        paymentService.handleCheckoutCancel();
    }, []);

    return (
        <div className="subscriptions-page">
            <Sidebar />
            <div className="subscriptions-main-content">
                <Header />
                <div className="subscriptions-container">
                    <div className="checkout-cancel">
                        <div className="cancel-icon">✕</div>
                        <h1>Pagamento Cancelado</h1>
                        <p className="cancel-message">
                            Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
                        </p>
                        <div className="cancel-details">
                            <p>
                                Não se preocupe! Você pode tentar novamente quando quiser.
                                Sua conta continua ativa com o plano Básico.
                            </p>
                        </div>
                        <div className="cancel-actions">
                            <button
                                onClick={() => navigate('/subscriptions')}
                                className="pricing-btn primary"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="pricing-btn"
                            >
                                Voltar ao Dashboard
                            </button>
                        </div>
                    </div>
                </div>
                <MobileBottomBar />
            </div>
        </div>
    );
};

export default CheckoutCancelPage;
