/**
 * Componente Header da Landing Page
 * Contém navegação e botões de autenticação
 */
import React from 'react';

/**
 * Componente Header com navegação e botões de autenticação
 */
const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Premiora</span>
          </div>
          <div className="nav-links">
            <a href="#features">Funcionalidades</a>
            <a href="#how-it-works">Como Funciona</a>
            <a href="#creators">Criadores</a>
            <a href="#pricing">Preços</a>
          </div>
          <div className="auth-buttons">
            <a href="/login" className="login-btn">Entrar</a>
            <a href="/login" className="cta-button-small">Começar</a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
