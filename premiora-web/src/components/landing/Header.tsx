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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

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
          
          <div className="auth-buttons desktop-only">
            <a href="/login" className="login-btn">Entrar</a>
            <a href="/login" className="cta-button-small">Começar</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
          <a href="#creators" onClick={() => setMobileMenuOpen(false)}>Criadores</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Preços</a>
        </div>
        <div className="mobile-auth-buttons">
          <a href="/login" className="login-btn-mobile">Entrar</a>
          <a href="/login" className="cta-button-mobile">Começar</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
