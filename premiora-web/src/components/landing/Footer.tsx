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
            <div className="logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>Premiora</span>
            </div>
            <p>A plataforma brasileira para monetização de conteúdo criativo.</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Plataforma</h4>
              <a href="#">Como Funciona</a>
              <a href="#">Preços</a>
              <a href="#">Criadores</a>
              <a href="#">Empresas</a>
            </div>
            <div className="footer-section">
              <h4>Suporte</h4>
              <a href="#">Central de Ajuda</a>
              <a href="#">Contato</a>
              <a href="#">Status</a>
              <a href="#">API</a>
            </div>
            <div className="footer-section">
              <h4>Empresa</h4>
              <a href="#">Sobre</a>
              <a href="#">Blog</a>
              <a href="#">Carreiras</a>
              <a href="#">Imprensa</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Premiora. Todos os direitos reservados.</p>
          <div className="footer-legal">
            <a href="#">Termos de Serviço</a>
            <a href="#">Política de Privacidade</a>
            <a href="#">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
