/**
 * Componente Footer da Landing Page
 * Rodapé com links e informações da empresa
 */
import React from 'react';

/**
 * Componente Footer com links de navegação e informações
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="/" className="logo">
              <img src="/assets/premiora-logo.png" alt="Premiora" />
              <span>Premiora</span>
            </a>
            <p>A plataforma brasileira para monetização de conteúdo criativo. Construa sua comunidade e viva da sua paixão.</p>
          </div>
          
          <div className="footer-links">
            <h4>Produto</h4>
            <ul>
              <li><a href="#features">Funcionalidades</a></li>
              <li><a href="#pricing">Preços</a></li>
              <li><a href="#showcase">Cases</a></li>
              <li><a href="/updates">Novidades</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Recursos</h4>
            <ul>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/guides">Guias</a></li>
              <li><a href="/help">Central de Ajuda</a></li>
              <li><a href="/api">API</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Empresa</h4>
            <ul>
              <li><a href="/about">Sobre</a></li>
              <li><a href="/careers">Carreiras</a></li>
              <li><a href="/legal">Legal</a></li>
              <li><a href="/contact">Contato</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2024 Premiora. Todos os direitos reservados.</p>
          <div style={{display: 'flex', gap: '1.5rem'}}>
            <a href="#" style={{color: 'var(--landing-text-muted)'}}>Instagram</a>
            <a href="#" style={{color: 'var(--landing-text-muted)'}}>Twitter</a>
            <a href="#" style={{color: 'var(--landing-text-muted)'}}>LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
