/**
 * Componente Pricing da Landing Page
 * Mostra os planos e preços da plataforma
 */
import React from 'react';

/**
 * Componente Pricing com cards de planos
 */
const Pricing: React.FC = () => {
  return (
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
            <a href="/login" className="pricing-btn primary">Experimente Grátis</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
