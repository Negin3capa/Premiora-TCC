/**
 * Componente Hero da Landing Page
 * Seção principal com proposta de valor e call-to-action
 */
import React from 'react';

/**
 * Componente Hero com proposta de valor e estatísticas
 */
const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-background" />
      <div className="hero-content">
        <div className="hero-text">
          <h1>Monetize seu conteúdo criativo</h1>
          <p>
            Conecte-se com seus fãs mais dedicados. Crie uma comunidade sustentável ao redor do seu trabalho e seja recompensado pelo valor que você entrega.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <strong>10,000+</strong>
              <span>Criadores</span>
            </div>
            <div className="stat">
              <strong>R$ 50M+</strong>
              <span>Pago mensalmente</span>
            </div>
            <div className="stat">
              <strong>2M+</strong>
              <span>Membros</span>
            </div>
          </div>
          <div className="hero-actions">
            <a href="/login" className="hero-cta-primary">Começar a Monetizar</a>
            <a href="#how-it-works" className="hero-cta-secondary">Ver Como Funciona</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mockup-container">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop"
              alt="Creator dashboard mockup"
              className="creator-mockup"
            />
            <div className="floating-card">
              💰 Recebendo apoios<br />
              hoje!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
