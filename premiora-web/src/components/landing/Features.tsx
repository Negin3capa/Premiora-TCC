/**
 * Componente Features da Landing Page
 * Mostra as principais funcionalidades da plataforma
 */
import React from 'react';

/**
 * Componente Features com grid de funcionalidades
 */
const Features: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header">
          <h2>Tudo que você precisa para monetizar</h2>
          <p>Ferramentas poderosas para criar uma relação sustentável com seus fãs.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Pagamentos Automáticos</h3>
            <p>Receba pagamentos mensais automaticamente via PIX com taxas mínimas.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Conteúdo Exclusivo</h3>
            <p>Crie posts exclusivos e tiers personalizados para diferentes níveis de apoio.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Análises Detalhadas</h3>
            <p>Acompanhe seu crescimento com métricas completas sobre engajamento e receita.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Comunicação Direta</h3>
            <p>Interaja diretamente com seus membros através de chat privado e comentários.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Personalização Total</h3>
            <p>Customize sua página completamente para refletir sua marca pessoal.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Integração com Redes</h3>
            <p>Conecte com suas redes sociais e importe conteúdo automaticamente.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
