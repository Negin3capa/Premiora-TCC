import React from 'react';

// Componente Footer: Rodapé com links
const Footer: React.FC = () => {
  const handleLinkClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    // Por enquanto, apenas previne o comportamento padrão
    // Futuramente pode abrir modais ou navegar para páginas específicas
    console.log(`Link clicado: ${sectionId}`);
  };

  return React.createElement('footer', { className: 'footer' },
    React.createElement('div', { className: 'footer-content' },
      React.createElement('p', null, '© 2024 Premiora. Todos os direitos reservados.'),
      React.createElement('div', { className: 'footer-links' },
        React.createElement('a', { href: '#', onClick: handleLinkClick('sobre') }, 'Sobre'),
        React.createElement('a', { href: '#', onClick: handleLinkClick('privacidade') }, 'Privacidade'),
        React.createElement('a', { href: '#', onClick: handleLinkClick('termos') }, 'Termos'),
        React.createElement('a', { href: '#', onClick: handleLinkClick('contato') }, 'Contato')
      )
    )
  );
};

export default Footer;
