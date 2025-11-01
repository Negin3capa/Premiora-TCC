/**
 * Componente Social Proof da Landing Page
 * Mostra marcas e empresas que confiam na plataforma
 */
import React from 'react';

/**
 * Componente Social Proof com logos de marcas parceiras
 */
const SocialProof: React.FC = () => {
  return (
    <section className="social-proof">
      <div className="container">
        <h2>Criadores incríveis confiam no Premiora</h2>
        <div className="brands-grid">
          <div className="brand-placeholder">Marca 1</div>
          <div className="brand-placeholder">Marca 2</div>
          <div className="brand-placeholder">Marca 3</div>
          <div className="brand-placeholder">Marca 4</div>
          <div className="brand-placeholder">Marca 5</div>
          <div className="brand-placeholder">Marca 6</div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
