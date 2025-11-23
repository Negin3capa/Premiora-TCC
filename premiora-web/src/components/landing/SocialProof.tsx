/**
 * Componente Social Proof da Landing Page
 * Marquee infinito com categorias de criadores
 */
import React from 'react';

const SocialProof: React.FC = () => {
  // Duplicating items for seamless loop
  const items = [
    "Podcasters", "Artistas", "Músicos", "Writers", "Gamers", "Educadores",
    "Desenvolvedores", "Jornalistas", "Filmmakers", "Designers"
  ];

  return (
    <section className="social-proof" style={{ overflow: 'hidden', padding: '40px 0', background: 'var(--landing-bg-dark)' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--landing-text-muted)', fontWeight: 'normal' }}>
          A casa de <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>+100.000</span> criadores independentes
        </h2>
      </div>
      
      <div className="marquee-container" style={{ display: 'flex', width: '100%', overflow: 'hidden' }}>
        <div className="marquee-content" style={{ 
          display: 'flex', 
          gap: '4rem', 
          animation: 'marquee 30s linear infinite',
          whiteSpace: 'nowrap',
          paddingLeft: '4rem'
        }}>
          {items.map((item, index) => (
            <span key={index} style={{ 
              fontSize: '4rem', 
              fontWeight: '800', 
              color: 'var(--color-text-tertiary)',
              opacity: 0.2,
              textTransform: 'uppercase'
            }}>
              {item}
            </span>
          ))}
          {/* Duplicate for loop */}
          {items.map((item, index) => (
            <span key={`dup-${index}`} style={{ 
              fontSize: '4rem', 
              fontWeight: '800', 
              color: 'var(--color-text-tertiary)',
              opacity: 0.2,
              textTransform: 'uppercase'
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
