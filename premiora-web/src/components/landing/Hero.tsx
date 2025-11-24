/**
 * Componente Hero da Landing Page
 * Primeira dobra com alto impacto visual e mensagem clara
 */
import React, { useEffect, useRef } from 'react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.animate-target');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-background" />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="animate-target" style={{ opacity: 0 }}>
            Crie.<br />
            <span style={{ color: 'var(--landing-primary)' }}>Compartilhe.</span><br />
            Lucre.
          </h1>
          <p className="animate-target delay-100" style={{ opacity: 0 }}>
            A plataforma definitiva para criadores que querem transformar sua paixão em um negócio sustentável. Sem algoritmos, apenas você e seus fãs.
          </p>
          <div className="hero-actions animate-target delay-200" style={{ opacity: 0 }}>
            <a href="/login" className="hero-cta-primary">Começar Agora</a>
            <a href="#how-it-works" className="hero-cta-secondary">Ver Demo</a>
          </div>
        </div>
        <div className="hero-visual animate-target delay-300" style={{ opacity: 0 }}>
          <div className="creator-mockup-wrapper">
             {/* Placeholder for a dynamic video or high-res image */}
             <div className="creator-mockup" style={{
               background: 'url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80) center/cover',
               minHeight: '500px',
               position: 'relative'
             }}>
                <div className="floating-badge" style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '-20px',
                  background: '#fff',
                  color: '#000',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  🎉 Novo apoiador!
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
