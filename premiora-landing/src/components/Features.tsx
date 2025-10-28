import React from 'react';

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

export default Features;
