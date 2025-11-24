import React, { useState, useEffect } from 'react';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { paymentService } from '../services/payment';
import '../styles/SubscriptionsPage.css';

// Price ID do Stripe - deve ser configurado nas variáveis de ambiente
const STRIPE_PREMIUM_PRICE_ID = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || '';

const SubscriptionsPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Verificar se usuário já é premium
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (userProfile?.tier === 'premium') {
        setIsPremium(true);
      }
    };
    checkPremiumStatus();
  }, [userProfile]);

  /**
   * Handler para o botão Subscribe
   */
  const handleSubscribe = async () => {
    // Verificar se usuário está autenticado
    if (!user) {
      showWarning('Login necessário', 'Faça login para assinar o plano Premium');
      window.location.href = '/login';
      return;
    }

    // Verificar se já é premium
    if (isPremium) {
      showWarning('Já é Premium', 'Você já possui uma assinatura Premium ativa');
      return;
    }

    // Verificar se Price ID está configurado
    if (!STRIPE_PREMIUM_PRICE_ID) {
      showError('Configuração inválida', 'Price ID do Stripe não configurado');
      console.error('VITE_STRIPE_PREMIUM_PRICE_ID não está definido');
      return;
    }

    setIsLoading(true);

    try {
      // Criar sessão de checkout
      const checkoutUrl = await paymentService.createCheckoutSession(STRIPE_PREMIUM_PRICE_ID);

      // Redirecionar para Stripe Checkout
      showSuccess('Redirecionando...', 'Você será redirecionado para a página de pagamento');
      paymentService.redirectToCheckout(checkoutUrl);
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      showError(
        'Erro ao processar pagamento',
        error instanceof Error ? error.message : 'Tente novamente mais tarde'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="subscriptions-page">
      <Sidebar />
      <div className="subscriptions-main-content">
        <Header />
        <div className="subscriptions-container">
          <section id="pricing" className="pricing">
            <div className="container">
              <h2>Escolha seu plano</h2>
              <div className="pricing-grid">
                <div className="pricing-card basic">
                  <h3>Básico</h3>
                  <div className="price">
                    <span className="currency">R$</span>
                    <span className="amount">0</span>
                    <span className="period">/mês</span>
                  </div>
                  <p>Perfeito para começar</p>
                  <ul>
                    <li>Perfil personalizado</li>
                    <li>Postagens públicas</li>
                    <li>Links de doação</li>
                    <li>Suporte básico</li>
                  </ul>
                  <a href="/login" className="pricing-btn">Começar Grátis</a>
                </div>
                <div className="pricing-card pro">
                  <div className="popular-badge">Mais Popular</div>
                  <h3>Premium</h3>
                  <div className="price">
                    <span className="currency">R$</span>
                    <span className="amount">29</span>
                    <span className="period">/mês</span>
                  </div>
                  <p>Para criadores sérios</p>
                  <ul>
                    <li>Tudo do Básico</li>
                    <li>Conteúdo exclusivo</li>
                    <li>Membros ilimitados</li>
                    <li>Análises avançadas</li>
                    <li>Pagamentos prioritários</li>
                    <li>Suporte premium</li>
                  </ul>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubscribe();
                    }}
                    className={`pricing-btn primary ${isLoading ? 'loading' : ''} ${isPremium ? 'disabled' : ''}`}
                    style={{ pointerEvents: isLoading || isPremium ? 'none' : 'auto' }}
                  >
                    {isLoading ? 'Processando...' : isPremium ? 'Assinatura Ativa' : 'Subscribe'}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
        <MobileBottomBar />
      </div>
    </div>
  );
};

export default SubscriptionsPage;
