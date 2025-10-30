import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Componente Navbar: Navegação fixa no topo
const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleNavClick = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/login';
  };

  return React.createElement('nav', { className: 'navbar' },
    React.createElement('div', { className: 'navbar-content' },
      React.createElement('div', { className: 'logo' }, 'Premiora'),
      React.createElement('div', { className: 'nav-links' },
        React.createElement('a', { href: '#features', onClick: handleNavClick('features') }, 'Recursos'),
        React.createElement('a', { href: '#benefits', onClick: handleNavClick('benefits') }, 'Benefícios'),
        React.createElement('a', { href: '#cta', onClick: handleNavClick('cta') }, 'Começar'),
        user ? React.createElement('button', { onClick: signOut, className: 'logout-button' }, 'Sair') : React.createElement('a', { href: '/login', onClick: handleLoginClick }, 'Entrar')
      )
    )
  );
};

export default Navbar;
