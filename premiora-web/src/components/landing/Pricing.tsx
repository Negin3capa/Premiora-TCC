/**
 * Componente Pricing da Landing Page
 * Mostra os planos e preços da plataforma
 */
import React from 'react';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="features-header">
          <h2>Comece gratuitamente</h2>
          <p>Nós só ganhamos quando você ganha. Sem taxas escondidas.</p>
        </div>
        
        <div className="pricing-grid" style={{ alignItems: 'stretch' }}>
          <div className="pricing-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>Lite</h3>
            <div className="price">
              <span className="amount">5%</span>
              <span className="period">taxa</span>
            </div>
            <p>Para quem está começando.</p>
            <ul style={{ flex: 1 }}>
              <li>Página personalizada</li>
              <li>Ferramentas de comunidade</li>
              <li>Pagamentos mensais</li>
              <li>Suporte por email</li>
            </ul>
            <a href="/login" className="pricing-btn">Criar Conta Grátis</a>
          </div>
          
          <div className="pricing-card pro" style={{ display: 'flex', flexDirection: 'column', transform: 'scale(1.05)', zIndex: 2 }}>
            <div className="popular-badge">Recomendado</div>
            <h3>Pro</h3>
            <div className="price">
              <span className="amount">8%</span>
              <span className="period">taxa</span>
            </div>
            <p>Para quem quer crescer.</p>
            <ul style={{ flex: 1 }}>
              <li>Tudo do plano Lite</li>
              <li>Múltiplos níveis de assinatura</li>
              <li>Analytics avançado</li>
              <li>Integrações exclusivas</li>
              <li>Suporte prioritário</li>
            </ul>
            <a href="/login" className="pricing-btn primary">Começar Agora</a>
          </div>
          
          <div className="pricing-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3>Premium</h3>
            <div className="price">
              <span className="amount">12%</span>
              <span className="period">taxa</span>
            </div>
            <p>Para empresas estabelecidas.</p>
            <ul style={{ flex: 1 }}>
              <li>Tudo do plano Pro</li>
              <li>Gerente de conta dedicado</li>
              <li>Merch exclusivo</li>
              <li>Contratos personalizados</li>
              <li>API de acesso total</li>
            </ul>
            <a href="/contact" className="pricing-btn">Falar com Vendas</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
