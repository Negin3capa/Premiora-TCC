/**
 * Componente CTA da Landing Page
 * Call-to-action final para conversão
 */
import React from 'react';

/**
 * Componente CTA com chamada final para ação
 */
const CTA: React.FC = () => {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Pronto para monetizar seu talento?</h2>
          <p>Junte-se a milhares de criadores que já transformaram sua paixão em renda sustentável.</p>
          <div className="cta-actions">
            <a href="/login" className="cta-button-large">Começar Agora</a>
            <p className="cta-note">Grátis por 30 dias • Sem cartão de crédito</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
