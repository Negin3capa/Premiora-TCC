import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './Login';
import './App.css';

// Componente Navbar: Navegação fixa no topo
const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();

  return React.createElement('nav', { className: 'navbar' },
    React.createElement('div', { className: 'navbar-content' },
      React.createElement('div', { className: 'logo' }, 'Premiora'),
      React.createElement('div', { className: 'nav-links' },
        React.createElement('a', { href: '#features' }, 'Recursos'),
        React.createElement('a', { href: '#benefits' }, 'Benefícios'),
        React.createElement('a', { href: '#cta' }, 'Começar'),
        user ? React.createElement('button', { onClick: signOut, className: 'logout-button' }, 'Sair') : React.createElement('a', { href: '/login' }, 'Entrar')
      )
    )
  );
};

// Componente Hero: Seção principal com título e chamada para ação
const Hero: React.FC = () => {
  return React.createElement('section', { className: 'hero' },
    React.createElement('div', { className: 'hero-content' },
      React.createElement('h1', null, 'Unindo Comunidade, Conteúdo e Renda'),
      React.createElement('p', null, 'Uma plataforma SaaS revolucionária que combina o melhor do Patreon, Discord, YouTube e Reddit em um só lugar. Crie, conecte e monetize como nunca antes.'),
      React.createElement('div', { className: 'hero-buttons' },
        React.createElement('button', { className: 'cta-button' }, 'Comece Gratuitamente'),
        React.createElement('button', { className: 'secondary-button' }, 'Ver Demonstração')
      )
    )
  );
};

// Componente Features: Destaque dos recursos principais
const Features: React.FC = () => {
  return React.createElement('section', { className: 'features', id: 'features' },
    React.createElement('div', { className: 'features-content' },
      React.createElement('h2', null, 'Recursos Poderosos'),
      React.createElement('p', { className: 'features-subtitle' }, 'Tudo que você precisa para criar uma comunidade engajada e monetizar seu conteúdo de forma inteligente.'),
      React.createElement('div', { className: 'features-grid' },
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '👥'),
          React.createElement('h3', null, 'Comunidades Vibrantes'),
          React.createElement('p', null, 'Conecte-se com criadores e fãs em comunidades interativas, inspiradas no Discord, com chat em tempo real e salas temáticas.')
        ),
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '🎥'),
          React.createElement('h3', null, 'Conteúdo Diversificado'),
          React.createElement('p', null, 'Compartilhe vídeos, lives, posts e discussões, combinando a flexibilidade do YouTube com a profundidade do Reddit.')
        ),
        React.createElement('div', { className: 'feature-card' },
          React.createElement('div', { className: 'feature-icon' }, '💰'),
          React.createElement('h3', null, 'Monetização Inteligente'),
          React.createElement('p', null, 'Ganhe dinheiro através de assinaturas, doações e vendas exclusivas, com ferramentas avançadas inspiradas no Patreon.')
        )
      )
    )
  );
};

// Componente Benefits: Benefícios para usuários
const Benefits: React.FC = () => {
  return React.createElement('section', { className: 'benefits', id: 'benefits' },
    React.createElement('div', { className: 'benefits-content' },
      React.createElement('h2', null, 'Por Que Escolher Premiora?'),
      React.createElement('p', { className: 'benefits-subtitle' }, 'Uma experiência única que transforma a forma como criadores e fãs interagem online.'),
      React.createElement('div', { className: 'benefits-grid' },
        React.createElement('div', { className: 'benefit-item' },
          React.createElement('div', { className: 'benefit-icon' }, '🚀'),
          React.createElement('h3', null, 'Tudo em Um Lugar'),
          React.createElement('p', null, 'Não precisa mais alternar entre múltiplas plataformas. Tenha comunidade, conteúdo e renda centralizados.')
        ),
        React.createElement('div', { className: 'benefit-item' },
          React.createElement('div', { className: 'benefit-icon' }, '🔒'),
          React.createElement('h3', null, 'Conteúdo Exclusivo'),
          React.createElement('p', null, 'Ofereça experiências únicas para seus apoiadores mais fiéis com conteúdo premium e interações especiais.')
        ),
        React.createElement('div', { className: 'benefit-item' },
          React.createElement('div', { className: 'benefit-icon' }, '📊'),
          React.createElement('h3', null, 'Analytics Avançados'),
          React.createElement('p', null, 'Acompanhe o engajamento, crescimento da comunidade e performance de monetização em tempo real.')
        ),
        React.createElement('div', { className: 'benefit-item' },
          React.createElement('div', { className: 'benefit-icon' }, '🎨'),
          React.createElement('h3', null, 'Personalização Total'),
          React.createElement('p', null, 'Customize sua presença com temas, layouts e ferramentas que refletem sua marca única.')
        )
      )
    )
  );
};

// Componente CTA: Chamada para ação final
const CTA: React.FC = () => {
  return React.createElement('section', { className: 'cta', id: 'cta' },
    React.createElement('div', { className: 'cta-content' },
      React.createElement('h2', null, 'Pronto para Revolucionar Seu Conteúdo?'),
      React.createElement('p', null, 'Junte-se a milhares de criadores que já estão transformando suas paixões em carreiras sustentáveis.'),
      React.createElement('button', { className: 'cta-button' }, 'Criar Conta Gratuita')
    )
  );
};

// Componente Footer: Rodapé com links
const Footer: React.FC = () => {
  return React.createElement('footer', { className: 'footer' },
    React.createElement('div', { className: 'footer-content' },
      React.createElement('p', null, '© 2024 Premiora. Todos os direitos reservados.'),
      React.createElement('div', { className: 'footer-links' },
        React.createElement('a', { href: '#' }, 'Sobre'),
        React.createElement('a', { href: '#' }, 'Privacidade'),
        React.createElement('a', { href: '#' }, 'Termos'),
        React.createElement('a', { href: '#' }, 'Contato')
      )
    )
  );
};

// Componente Landing Page
const LandingPage: React.FC = () => {
  return React.createElement('div', { className: 'App' },
    React.createElement(Navbar, null),
    React.createElement(Hero, null),
    React.createElement(Features, null),
    React.createElement(Benefits, null),
    React.createElement(CTA, null),
    React.createElement(Footer, null)
  );
};

// Componente principal App com roteamento
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default App;
