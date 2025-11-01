/**
 * Landing Page do Premiora
 * Design inspirado no Patreon - plataforma para monetização de conteúdo
 */
import React from 'react';
import '../styles/landing-page.css';

/**
 * Componente principal da Landing Page inspirada no Patreon
 * Estrutura otimizada para conversão de criadores de conteúdo
 */
const LandingPage: React.FC = () => {
  return React.createElement('div', { className: 'landing-page' },
    // Header/Navigation
    React.createElement('header', { className: 'header' },
      React.createElement('nav', { className: 'navbar' },
        React.createElement('div', { className: 'navbar-content' },
          React.createElement('div', { className: 'logo' },
            React.createElement('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
              React.createElement('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' })
            ),
            React.createElement('span', null, 'Premiora')
          ),
          React.createElement('div', { className: 'nav-links' },
            React.createElement('a', { href: '#features' }, 'Funcionalidades'),
            React.createElement('a', { href: '#how-it-works' }, 'Como Funciona'),
            React.createElement('a', { href: '#creators' }, 'Criadores'),
            React.createElement('a', { href: '#pricing' }, 'Preços')
          ),
          React.createElement('div', { className: 'auth-buttons' },
            React.createElement('a', { href: '/login', className: 'login-btn' }, 'Entrar'),
            React.createElement('a', { href: '/login', className: 'cta-button-small' }, 'Começar')
          )
        )
      )
    ),

    // Hero Section - Seção principal focada na proposta de valor
    React.createElement('section', { className: 'hero' },
      React.createElement('div', { className: 'hero-background' }),
      React.createElement('div', { className: 'hero-content' },
        React.createElement('div', { className: 'hero-text' },
          React.createElement('h1', null, 'Monetize seu conteúdo criativo'),
          React.createElement('p', null,
            'Conecte-se com seus fãs mais dedicados. Crie uma comunidade sustentável ao redor do seu trabalho e seja recompensado pelo valor que você entrega.'
          ),
          React.createElement('div', { className: 'hero-stats' },
            React.createElement('div', { className: 'stat' },
              React.createElement('strong', null, '10,000+'),
              React.createElement('span', null, 'Criadores'),
            ),
            React.createElement('div', { className: 'stat' },
              React.createElement('strong', null, 'R$ 50M+'),
              React.createElement('span', null, 'Pago mensalmente'),
            ),
            React.createElement('div', { className: 'stat' },
              React.createElement('strong', null, '2M+'),
              React.createElement('span', null, 'Membros'),
            )
          ),
          React.createElement('div', { className: 'hero-actions' },
            React.createElement('a', { href: '/login', className: 'hero-cta-primary' }, 'Começar a Monetizar'),
            React.createElement('a', { href: '#how-it-works', className: 'hero-cta-secondary' }, 'Ver Como Funciona')
          )
        ),
        React.createElement('div', { className: 'hero-visual' },
          React.createElement('div', { className: 'mockup-container' },
            React.createElement('img', {
              src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
              alt: 'Creator dashboard mockup',
              className: 'creator-mockup'
            }),
            React.createElement('div', { className: 'floating-card' },
              '💰 Recebendo apoios',
              React.createElement('br'),
              'hoje!'
            )
          )
        )
      )
    ),

    // Social Proof Section
    React.createElement('section', { className: 'social-proof' },
      React.createElement('div', { className: 'container' },
        React.createElement('h2', null, 'Criadores incríveis confiam no Premiora'),
        React.createElement('div', { className: 'brands-grid' },
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 1'),
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 2'),
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 3'),
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 4'),
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 5'),
          React.createElement('div', { className: 'brand-placeholder' }, 'Marca 6')
        )
      )
    ),

    // How It Works Section
    React.createElement('section', { id: 'how-it-works', className: 'how-it-works' },
      React.createElement('div', { className: 'container' },
        React.createElement('h2', null, 'Como funciona'),
        React.createElement('div', { className: 'steps-grid' },
          React.createElement('div', { className: 'step' },
            React.createElement('div', { className: 'step-number' }, '1'),
            React.createElement('h3', null, 'Crie seu perfil'),
            React.createElement('p', null, 'Configure sua página com seu conteúdo, metas e benefícios exclusivos para seus membros.')
          ),
          React.createElement('div', { className: 'step' },
            React.createElement('div', { className: 'step-number' }, '2'),
            React.createElement('h3', null, 'Engaje sua comunidade'),
            React.createElement('p', null, 'Publique conteúdo exclusivo, atualizações e interaja diretamente com seus apoiadores.')
          ),
          React.createElement('div', { className: 'step' },
            React.createElement('div', { className: 'step-number' }, '3'),
            React.createElement('h3', null, 'Receba apoio mensal'),
            React.createElement('p', null, 'Seus membros contribuem mensalmente e você recebe pagamentos diretamente via PIX.')
          )
        )
      )
    ),

    // Features Section
    React.createElement('section', { id: 'features', className: 'features' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'features-header' },
          React.createElement('h2', null, 'Tudo que você precisa para monetizar'),
          React.createElement('p', null, 'Ferramentas poderosas para criar uma relação sustentável com seus fãs.')
        ),
        React.createElement('div', { className: 'features-grid' },
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '💳'),
            React.createElement('h3', null, 'Pagamentos Automáticos'),
            React.createElement('p', null, 'Receba pagamentos mensais automaticamente via PIX com taxas mínimas.')
          ),
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '🔒'),
            React.createElement('h3', null, 'Conteúdo Exclusivo'),
            React.createElement('p', null, 'Crie posts exclusivos e tiers personalizados para diferentes níveis de apoio.')
          ),
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '📊'),
            React.createElement('h3', null, 'Análises Detalhadas'),
            React.createElement('p', null, 'Acompanhe seu crescimento com métricas completas sobre engajamento e receita.')
          ),
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '💬'),
            React.createElement('h3', null, 'Comunicação Direta'),
            React.createElement('p', null, 'Interaja diretamente com seus membros através de chat privado e comentários.')
          ),
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '🎨'),
            React.createElement('h3', null, 'Personalização Total'),
            React.createElement('p', null, 'Customize sua página completamente para refletir sua marca pessoal.')
          ),
          React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon' }, '🌐'),
            React.createElement('h3', null, 'Integração com Redes'),
            React.createElement('p', null, 'Conecte com suas redes sociais e importe conteúdo automaticamente.')
          )
        )
      )
    ),

    // Testimonials Section
    React.createElement('section', { className: 'testimonials' },
      React.createElement('div', { className: 'container' },
        React.createElement('h2', null, 'Histórias de sucesso'),
        React.createElement('div', { className: 'testimonials-grid' },
          React.createElement('div', { className: 'testimonial' },
            React.createElement('div', { className: 'testimonial-content' },
              React.createElement('p', null, '"O Premiora transformou minha relação com meus fãs. Agora posso me dedicar 100% ao meu conteúdo sabendo que tenho apoio financeiro sustentável."'),
              React.createElement('div', { className: 'testimonial-author' },
                React.createElement('img', { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', alt: 'Creator' }),
                React.createElement('div', null,
                  React.createElement('strong', null, 'Maria Santos'),
                  React.createElement('span', null, 'Artista Digital • R$ 15k/mês')
                )
              )
            )
          ),
          React.createElement('div', { className: 'testimonial' },
            React.createElement('div', { className: 'testimonial-content' },
              React.createElement('p', null, '"Finalmente posso viver do que amo! Os benefícios exclusivos criaram uma comunidade incrível ao redor do meu trabalho."'),
              React.createElement('div', { className: 'testimonial-author' },
                React.createElement('img', { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', alt: 'Creator' }),
                React.createElement('div', null,
                  React.createElement('strong', null, 'Carlos Lima'),
                  React.createElement('span', null, 'Músico • R$ 8k/mês')
                )
              )
            )
          ),
          React.createElement('div', { className: 'testimonial' },
            React.createElement('div', { className: 'testimonial-content' },
              React.createElement('p', null, '"O suporte da equipe é incrível e as ferramentas são intuitivas. Cresci mais rápido do que imaginei."'),
              React.createElement('div', { className: 'testimonial-author' },
                React.createElement('img', { src: 'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=60&h=60&fit=crop&crop=face', alt: 'Creator' }),
                React.createElement('div', null,
                  React.createElement('strong', null, 'Ana Costa'),
                  React.createElement('span', null, 'Escritora • R$ 12k/mês')
                )
              )
            )
          )
        )
      )
    ),

    // Pricing Section
    React.createElement('section', { id: 'pricing', className: 'pricing' },
      React.createElement('div', { className: 'container' },
        React.createElement('h2', null, 'Escolha seu plano'),
        React.createElement('div', { className: 'pricing-grid' },
          React.createElement('div', { className: 'pricing-card basic' },
            React.createElement('h3', null, 'Básico'),
            React.createElement('div', { className: 'price' },
              React.createElement('span', { className: 'currency' }, 'R$'),
              React.createElement('span', { className: 'amount' }, '0'),
              React.createElement('span', { className: 'period' }, '/mês')
            ),
            React.createElement('p', null, 'Perfeito para começar'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Perfil personalizado'),
              React.createElement('li', null, 'Postagens públicas'),
              React.createElement('li', null, 'Links de doação'),
              React.createElement('li', null, 'Suporte básico')
            ),
            React.createElement('a', { href: '/login', className: 'pricing-btn' }, 'Começar Grátis')
          ),
          React.createElement('div', { className: 'pricing-card pro' },
            React.createElement('div', { className: 'popular-badge' }, 'Mais Popular'),
            React.createElement('h3', null, 'Premium'),
            React.createElement('div', { className: 'price' },
              React.createElement('span', { className: 'currency' }, 'R$'),
              React.createElement('span', { className: 'amount' }, '29'),
              React.createElement('span', { className: 'period' }, '/mês')
            ),
            React.createElement('p', null, 'Para criadores sérios'),
            React.createElement('ul', null,
              React.createElement('li', null, 'Tudo do Básico'),
              React.createElement('li', null, 'Conteúdo exclusivo'),
              React.createElement('li', null, 'Membros ilimitados'),
              React.createElement('li', null, 'Análises avançadas'),
              React.createElement('li', null, 'Pagamentos prioritários'),
              React.createElement('li', null, 'Suporte premium')
            ),
            React.createElement('a', { href: '/login', className: 'pricing-btn primary' }, 'Experimente Grátis')
          )
        )
      )
    ),

    // FAQ Section
    React.createElement('section', { className: 'faq' },
      React.createElement('div', { className: 'container' },
        React.createElement('h2', null, 'Perguntas frequentes'),
        React.createElement('div', { className: 'faq-grid' },
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Como recebo os pagamentos?'),
            React.createElement('p', null, 'Os pagamentos são processados mensalmente via PIX, com depósitos diretos em sua conta bancária. Não há intermediários.')
          ),
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Posso cancelar a qualquer momento?'),
            React.createElement('p', null, 'Sim! Seus membros podem cancelar a assinatura a qualquer momento, e você pode encerrar sua conta quando quiser.')
          ),
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Quais taxas vocês cobram?'),
            React.createElement('p', null, 'Cobramos apenas 5% sobre cada transação, uma das menores taxas do mercado. Não há taxa de setup ou mensalidade.')
          ),
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Meus dados estão seguros?'),
            React.createElement('p', null, 'Utilizamos criptografia de nível bancário e nunca compartilhamos seus dados. Somos transparentes sobre nossa privacidade.')
          ),
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Posso importar meu conteúdo?'),
            React.createElement('p', null, 'Sim! Você pode importar posts de redes sociais, blogs e outras plataformas para começar rapidamente.')
          ),
          React.createElement('div', { className: 'faq-item' },
            React.createElement('h3', null, 'Quanto tempo demora para começar?'),
            React.createElement('p', null, 'Você pode configurar sua página em poucos minutos. Os primeiros pagamentos chegam geralmente na primeira semana.')
          )
        )
      )
    ),

    // CTA Section
    React.createElement('section', { className: 'cta-section' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'cta-content' },
          React.createElement('h2', null, 'Pronto para monetizar seu talento?'),
          React.createElement('p', null, 'Junte-se a milhares de criadores que já transformaram sua paixão em renda sustentável.'),
          React.createElement('div', { className: 'cta-actions' },
            React.createElement('a', { href: '/login', className: 'cta-button-large' }, 'Começar Agora'),
            React.createElement('p', { className: 'cta-note' }, 'Grátis por 30 dias • Sem cartão de crédito')
          )
        )
      )
    ),

    // Footer
    React.createElement('footer', { className: 'footer' },
      React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'footer-content' },
          React.createElement('div', { className: 'footer-brand' },
            React.createElement('div', { className: 'logo' },
              React.createElement('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
                React.createElement('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' })
              ),
              React.createElement('span', null, 'Premiora')
            ),
            React.createElement('p', null, 'A plataforma brasileira para monetização de conteúdo criativo.')
          ),
          React.createElement('div', { className: 'footer-links' },
            React.createElement('div', { className: 'footer-section' },
              React.createElement('h4', null, 'Plataforma'),
              React.createElement('a', { href: '#' }, 'Como Funciona'),
              React.createElement('a', { href: '#' }, 'Preços'),
              React.createElement('a', { href: '#' }, 'Criadores'),
              React.createElement('a', { href: '#' }, 'Empresas')
            ),
            React.createElement('div', { className: 'footer-section' },
              React.createElement('h4', null, 'Suporte'),
              React.createElement('a', { href: '#' }, 'Central de Ajuda'),
              React.createElement('a', { href: '#' }, 'Contato'),
              React.createElement('a', { href: '#' }, 'Status'),
              React.createElement('a', { href: '#' }, 'API')
            ),
            React.createElement('div', { className: 'footer-section' },
              React.createElement('h4', null, 'Empresa'),
              React.createElement('a', { href: '#' }, 'Sobre'),
              React.createElement('a', { href: '#' }, 'Blog'),
              React.createElement('a', { href: '#' }, 'Carreiras'),
              React.createElement('a', { href: '#' }, 'Imprensa')
            )
          )
        ),
        React.createElement('div', { className: 'footer-bottom' },
          React.createElement('p', null, '© 2024 Premiora. Todos os direitos reservados.'),
          React.createElement('div', { className: 'footer-legal' },
            React.createElement('a', { href: '#' }, 'Termos de Serviço'),
            React.createElement('a', { href: '#' }, 'Política de Privacidade'),
            React.createElement('a', { href: '#' }, 'Política de Cookies')
          )
        )
      )
    )
  );
};

export default LandingPage;
