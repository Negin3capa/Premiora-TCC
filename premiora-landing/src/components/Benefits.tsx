import React from 'react';

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

export default Benefits;
