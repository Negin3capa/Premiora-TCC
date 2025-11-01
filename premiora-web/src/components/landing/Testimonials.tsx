/**
 * Componente Testimonials da Landing Page
 * Mostra depoimentos de criadores que usam a plataforma
 */
import React from 'react';

/**
 * Componente Testimonials com depoimentos de usuários
 */
const Testimonials: React.FC = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <h2>Histórias de sucesso</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"O Premiora transformou minha relação com meus fãs. Agora posso me dedicar 100% ao meu conteúdo sabendo que tenho apoio financeiro sustentável."</p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong>Maria Santos</strong>
                  <span>Artista Digital • R$ 15k/mês</span>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Finalmente posso viver do que amo! Os benefícios exclusivos criaram uma comunidade incrível ao redor do meu trabalho."</p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong>Carlos Lima</strong>
                  <span>Músico • R$ 8k/mês</span>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"O suporte da equipe é incrível e as ferramentas são intuitivas. Cresci mais rápido do que imaginei."</p>
              <div className="testimonial-author">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=60&h=60&fit=crop&crop=face" alt="Creator" />
                <div>
                  <strong>Ana Costa</strong>
                  <span>Escritora • R$ 12k/mês</span>
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
