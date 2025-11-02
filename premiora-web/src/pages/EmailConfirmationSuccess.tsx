import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css';

/**
 * Página de sucesso da confirmação de email
 * Exibe confirmação visual de que o email foi verificado com sucesso
 * e redireciona automaticamente para a página inicial
 */
const EmailConfirmationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(3);

  // Contador regressivo e redirecionamento automático
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/home');
    }
  }, [countdown, navigate]);

  // Se usuário não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="login-page">
      {/* Premium Branding Header */}
      <div className="login-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Premiora</span>
        </div>
        <p className="brand-tagline">A plataforma brasileira para monetização de conteúdo criativo</p>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1>Email Confirmado!</h1>
          <p>Sua conta foi ativada com sucesso. Bem-vindo à Premiora!</p>
        </div>

        <div className="login-content">
          {/* Status de sucesso */}
          <div className="confirmation-status">
            <div className="status-success">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>Conta Ativada</h3>
              <p>Seu email foi verificado com sucesso. Você agora tem acesso completo à plataforma Premiora.</p>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="success-info">
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="info-content">
                <h4>Comece a Criar</h4>
                <p>Explore comunidades, publique seu conteúdo e comece a monetizar seu talento.</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63C19.68 7.55 18.92 7 18.09 7h-.09c-.92 0-1.68.55-1.87 1.37L14.5 16H16v6h4zM5.5 7L4 6.5 2.5 7 3 8.5 4 8l1.5.5L4.5 7zM8 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm-4 18v-6h2.5l-2.54-7.63C3.68 7.55 2.92 7 2.09 7H2c-.92 0-1.68.55-1.87 1.37L-1.5 16H0v6h4z"/>
                </svg>
              </div>
              <div className="info-content">
                <h4>Monetize seu Talento</h4>
                <p>Conecte-se com seu público e transforme sua criatividade em renda.</p>
              </div>
            </div>
          </div>

          {/* Contador de redirecionamento */}
          <div className="redirect-notice">
            <p>Redirecionando para sua página inicial em <span className="countdown">{countdown}</span> segundos...</p>
            <button
              onClick={() => navigate('/home')}
              className="skip-button"
            >
              Ir para o Início Agora
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>Precisa de ajuda? Entre em contato conosco através do suporte.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationSuccess;
