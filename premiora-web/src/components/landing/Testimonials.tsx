/**
 * Componente Testimonials da Landing Page
 * Layout Masonry para depoimentos
 */
import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section id="creators" className="testimonials" style={{ padding: '100px 0', background: 'var(--landing-bg-dark)' }}>
      <div className="container">
        <div className="features-header">
          <h2>Quem usa, aprova</h2>
          <p>Junte-se a milhares de criadores que vivem de sua arte.</p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="testimonial-content">
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "O Premiora me deu a liberdade de criar sem me preocupar com algoritmos. Minha comunidade nunca esteve tão engajada."
              </p>
              <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Maria Santos</strong>
                  <span style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem' }}>Artista Digital</span>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="testimonial-content">
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "A simplicidade do PIX mudou tudo. Meus assinantes adoram a facilidade e eu recebo na hora."
              </p>
              <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>João Silva</strong>
                  <span style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem' }}>Podcaster</span>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="testimonial-content">
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "Consegui financiar meu próximo livro apenas com o apoio dos meus leitores aqui. É revolucionário."
              </p>
              <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=100&h=100&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Ana Costa</strong>
                  <span style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem' }}>Escritora</span>
                </div>
              </div>
            </div>
          </div>

          <div className="testimonial">
            <div className="testimonial-content">
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "A melhor decisão da minha carreira foi focar nos meus superfãs. A plataforma é intuitiva e os pagamentos são pontuais."
              </p>
              <div className="testimonial-author" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong style={{ color: '#fff', display: 'block' }}>Carlos Lima</strong>
                  <span style={{ color: 'var(--landing-text-muted)', fontSize: '0.9rem' }}>Músico Independente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
