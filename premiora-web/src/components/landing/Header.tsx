/**
 * Componente Header da Landing Page
 * Contém navegação e botões de autenticação
 */
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useUI';

/**
 * Componente Header com navegação e botões de autenticação
 */
const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="navbar">
        <div className="navbar-content">
          <a href="/" className="logo">
            <img 
              src={isDark ? "/assets/premiora-logo.png" : "/assets/premiora-logo-light.png"} 
              alt="Premiora" 
            />
            <span>Premiora</span>
          </a>
          
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
