import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthForm, ProviderButtons } from '../components/auth';
import '../styles/login.css';

/**
 * Página de Login da aplicação Premiora
 * Permite login com email/senha e provedores OAuth
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Handlers para os componentes
  const handleAuthSuccess = () => {
    console.log('✅ Autenticação realizada com sucesso');
  };

  const handleAuthError = (errorMsg: string) => {
    console.error('❌ Erro na autenticação:', errorMsg);
  };

  const handleProviderSuccess = () => {
    console.log('✅ Login com provedor iniciado');
  };

  const handleProviderError = (errorMsg: string) => {
    console.error('❌ Erro no login com provedor:', errorMsg);
  };

  return (
    <div className="login-page">
      <div className="login-page-container">
        {/* Premium Branding Header */}
        <div className="login-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Premiora</span>
          </div>
        </div>

        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Continue criando e crescendo com sua comunidade.</p>
        </div>

        <div className="login-content">
          {/* Formulário de login */}
          <AuthForm
            mode="login"
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />

          {/* Separador */}
          <div className="divider">
            <span>ou</span>
          </div>

          {/* Botões de provedores OAuth */}
          <ProviderButtons
            onSuccess={handleProviderSuccess}
            onError={handleProviderError}
          />

          {/* Toggle para signup */}
          <div className="auth-toggle">
            <p>
              Não tem uma conta?
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="toggle-button"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p>Ao fazer login, você concorda com nossos <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
