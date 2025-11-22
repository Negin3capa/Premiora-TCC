/**
 * Componente Features da Landing Page
 * Bento Grid com as principais funcionalidades
 */
import React from 'react';

const Features: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features-header">
          <h2>Tudo que você precisa</h2>
          <p>Ferramentas poderosas para sua independência criativa.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Liberdade Criativa Total</h3>
            <p>Publique o que quiser, quando quiser. Sem censura de algoritmos ou restrições de formato. Seu espaço, suas regras.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Pagamentos Instantâneos</h3>
            <p>Receba via PIX direto na sua conta. Sem espera de 30 dias.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Dados reais sobre seu público.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Exclusividade</h3>
            <p>Conteúdo só para fãs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Comunidade Real</h3>
            <p>Ferramentas de engajamento direto. Enquetes, comentários exclusivos e mensagens diretas para seus maiores apoiadores.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
