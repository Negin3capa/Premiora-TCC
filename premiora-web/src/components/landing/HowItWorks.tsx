/**
 * Componente How It Works da Landing Page
 * Explica o processo de funcionamento da plataforma
 */
import React from 'react';

/**
 * Componente How It Works com os passos do processo
 */
const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <h2>Como funciona</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Crie seu perfil</h3>
            <p>Configure sua página com seu conteúdo, metas e benefícios exclusivos para seus membros.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Engaje sua comunidade</h3>
            <p>Publique conteúdo exclusivo, atualizações e interaja diretamente com seus apoiadores.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Receba apoio mensal</h3>
            <p>Seus membros contribuem mensalmente e você recebe pagamentos diretamente via PIX.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
