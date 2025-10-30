import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente Hero: Seção principal com título e chamada para ação
const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/login');
  };

  const handleViewDemo = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return React.createElement('section', { className: 'hero' },
    React.createElement('div', { className: 'hero-content' },
      React.createElement('h1', null, 'Unindo Comunidade, Conteúdo e Renda'),
      React.createElement('p', null, 'Uma plataforma SaaS revolucionária que combina o melhor do Patreon, Discord, YouTube e Reddit em um só lugar. Crie, conecte e monetize como nunca antes.'),
      React.createElement('div', { className: 'hero-buttons' },
        React.createElement('button', { className: 'cta-button', onClick: handleStartFree }, 'Comece Gratuitamente'),
        React.createElement('button', { className: 'secondary-button', onClick: handleViewDemo }, 'Ver Demonstração')
      )
    )
  );
};

export default Hero;
