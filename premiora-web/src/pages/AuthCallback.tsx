import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Página de callback para processar autenticação OAuth
 * Esta página é chamada após o usuário fazer login com Google/Facebook
 * Depende do AuthContext para determinar o status da autenticação
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando login...');

  useEffect(() => {
    let redirectTimer: number;

    // Aguardar o AuthContext terminar de carregar
    if (loading) {
      console.log('⏳ Aguardando carregamento do contexto de autenticação...');
      return;
    }

    // Se temos um usuário autenticado, o login foi bem-sucedido
    if (user) {
      console.log('✅ Usuário autenticado detectado no callback');
      setStatus('success');
      setMessage('Login realizado com sucesso! Redirecionando...');

      // Redirecionar para dashboard após 2 segundos
      redirectTimer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
      return;
    }

    // Se não temos usuário e não estamos carregando, houve um erro
    console.log('❌ Nenhum usuário autenticado encontrado no callback');
    setStatus('error');
    setMessage('Erro ao processar login. Redirecionando para login...');

    // Redirecionar para login após 3 segundos
    redirectTimer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);

    // Cleanup timer on unmount
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [user, loading, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Spinner de loading */}
        {status === 'loading' && (
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--color-border-light)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1s linear infinite'
          }} />
        )}

        {/* Ícone de sucesso */}
        {status === 'success' && (
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 24px',
            color: '#10b981'
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )}

        {/* Ícone de erro */}
        {status === 'error' && (
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 24px',
            color: '#ef4444'
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
          </div>
        )}

        <h2 style={{
          margin: '0 0 16px 0',
          color: 'var(--color-text-primary)',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {status === 'loading' && 'Processando Login'}
          {status === 'success' && 'Login Realizado!'}
          {status === 'error' && 'Erro no Login'}
        </h2>

        <p style={{
          margin: '0',
          color: 'var(--color-text-secondary)',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Link manual para casos de erro */}
        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
          >
            Voltar ao Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
