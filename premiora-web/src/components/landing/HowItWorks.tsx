/**
 * Componente How It Works da Landing Page
 * Layout Timeline vertical
 */
import React from 'react';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="features-header">
          <h2>Sua jornada começa aqui</h2>
          <p>Três passos simples para sua independência financeira.</p>
        </div>
        
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Crie sua Página</h3>
              <p>Personalize seu perfil com sua marca, bio e links. É sua casa digital, sem algoritmos para atrapalhar.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Defina seus Planos</h3>
              <p>Crie níveis de assinatura (Tiers) com benefícios exclusivos. Você decide o valor e o que entregar.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Receba Mensalmente</h3>
              <p>Seus fãs assinam e você recebe pagamentos recorrentes via PIX. Previsibilidade para sua carreira.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
