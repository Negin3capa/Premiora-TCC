import React from 'react';
import { useNavigate } from 'react-router-dom';

// Componente CTA: Chamada para ação final
const CTA: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/login');
  };

  return React.createElement('section', { className: 'cta', id: 'cta' },
    React.createElement('div', { className: 'cta-content' },
      React.createElement('h2', null, 'Pronto para Revolucionar Seu Conteúdo?'),
      React.createElement('p', null, 'Junte-se a milhares de criadores que já estão transformando suas paixões em carreiras sustentáveis.'),
      React.createElement('button', { className: 'cta-button', onClick: handleCreateAccount }, 'Criar Conta Gratuita')
    )
  );
};

export default CTA;
