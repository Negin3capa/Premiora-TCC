import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css';

/**
 * Página de confirmação de email após cadastro
 * Exibe instruções para o usuário verificar seu email
 * e lida com a confirmação quando o usuário clica no link
 */
const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  // Verificar se há parâmetros de confirmação na URL (quando usuário clica no link do email)
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const error = searchParams.get('error');

      // Se há erro nos parâmetros
      if (error) {
        setConfirmationStatus('error');
        setMessage('Erro na confirmação do email. O link pode ter expirado.');
        return;
      }

      // Se há token de confirmação
      if (token && type === 'signup') {
        try {
          // O Supabase já processa automaticamente os tokens de confirmação
          // quando o usuário é redirecionado para esta página
          setConfirmationStatus('success');
          setMessage('Email confirmado com sucesso! Redirecionando...');

          // Aguardar um pouco para mostrar a mensagem de sucesso
          setTimeout(() => {
            navigate('/email-confirmation-success');
          }, 2000);
        } catch (err) {
          setConfirmationStatus('error');
          setMessage('Erro ao confirmar email. Tente novamente.');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  // Se usuário já está autenticado (veio do link do email), redirecionar para sucesso
  useEffect(() => {
    if (user && !loading && confirmationStatus === 'pending') {
      navigate('/email-confirmation-success');
    }
  }, [user, loading, navigate, confirmationStatus]);

  // Função para reenviar email de confirmação
  const handleResendEmail = async () => {
    try {
      // Aqui seria implementada a lógica para reenviar email
      // Por enquanto, apenas mostra uma mensagem
      setMessage('Email de confirmação reenviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setMessage('Erro ao reenviar email. Tente novamente.');
    }
  };

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
          <h1>Confirme seu email</h1>
          <p>Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.</p>
        </div>

        <div className="login-content">
          {/* Status da confirmação */}
          <div className="confirmation-status">
            {confirmationStatus === 'pending' && (
              <div className="status-pending">
                <div className="email-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h3>Verifique seu email</h3>
                <p>Não consegue encontrar o email? Verifique sua pasta de spam ou lixo eletrônico.</p>
              </div>
            )}

            {confirmationStatus === 'success' && (
              <div className="status-success">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3>Email confirmado!</h3>
                <p>Sua conta foi ativada com sucesso. Você será redirecionado em instantes...</p>
              </div>
            )}

            {confirmationStatus === 'error' && (
              <div className="status-error">
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3>Erro na confirmação</h3>
                <p>{message}</p>
              </div>
            )}
          </div>

          {/* Mensagem adicional */}
          {message && confirmationStatus === 'pending' && (
            <div className="message-box">
              <p>{message}</p>
            </div>
          )}

          {/* Botão para reenviar email */}
          {confirmationStatus === 'pending' && (
            <button
              onClick={handleResendEmail}
              className="resend-button"
            >
              Reenviar email de confirmação
            </button>
          )}

          {/* Botão para voltar ao login */}
          <div className="auth-toggle">
            <p>
              Lembrou sua senha?
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="toggle-button"
              >
                Voltar ao login
              </button>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p>Não recebeu o email? Verifique sua pasta de spam ou clique em "Reenviar email de confirmação".</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
