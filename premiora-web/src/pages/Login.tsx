import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css';

// Componente de Login
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail, loading, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignupSuggestion, setShowSignupSuggestion] = useState(false);

  // Redirecionar para HomePage quando usuário está autenticado
  // Mas não redirecionar imediatamente após signup - aguardar confirmação de email
  useEffect(() => {
    if (user && !loading && !isSignUp) {
      navigate('/home');
    }
  }, [user, loading, navigate, isSignUp]);

  // Função para lidar com o clique no botão de login Google
  const handleGoogleLogin = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError('Erro ao fazer login com Google');
    }
  };

  // Função para lidar com o clique no botão de login Facebook
  const handleFacebookLogin = async () => {
    try {
      setError('');
      await signInWithFacebook();
    } catch (err) {
      setError('Erro ao fazer login com Facebook');
    }
  };

  // Validação básica de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para lidar com o formulário de email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação frontend
    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setError('');
      setShowSignupSuggestion(false);
      if (isSignUp) {
        await signUpWithEmail(email, password);
        // Após cadastro bem-sucedido, redirecionar para confirmação de email
        // O Supabase envia email de confirmação automaticamente
        navigate('/email-confirmation');
        return;
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      // Tratamento específico de erros do Supabase
      if (err.message?.includes('Email address') && err.message?.includes('is invalid')) {
        setError('Este email não é permitido. Use um email real válido.');
        setShowSignupSuggestion(false);
      } else if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
        setShowSignupSuggestion(false);
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
        setShowSignupSuggestion(true);
      } else {
        setError(err.message || 'Erro na autenticação');
        setShowSignupSuggestion(false);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
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
          <h1>{isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}</h1>
          <p>{isSignUp ? 'Junte-se a milhares de criadores que monetizam seu talento.' : 'Continue criando e crescendo com sua comunidade.'}</p>
        </div>

        <div className="login-content">
          {/* Formulário de email */}
          <form onSubmit={handleEmailSubmit} className="email-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="form-input"
              />
            </div>
            {error && <p className="error-message">{error}</p>}

            {/* Sugestão de cadastro quando login falha */}
            {showSignupSuggestion && !isSignUp && (
              <div className="signup-suggestion">
                <p>Não tem uma conta ainda?</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setShowSignupSuggestion(false);
                    setError('');
                  }}
                  className="signup-suggestion-button"
                >
                  Criar conta com este email
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="email-login-button"
            >
              {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </form>

          {/* Separador */}
          <div className="divider">
            <span>ou</span>
          </div>

          {/* Botão Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="google-login-button"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="google-icon" />
            {loading ? 'Carregando...' : `Entrar com Google`}
          </button>

          {/* Botão Facebook */}
          <button
            onClick={handleFacebookLogin}
            disabled={loading}
            className="facebook-login-button"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
              alt="Facebook"
              className="facebook-icon"
            />
            {loading ? 'Carregando...' : `Entrar com Facebook`}
          </button>

          {/* Toggle entre login e registro */}
          <div className="auth-toggle">
            <p>
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="toggle-button"
              >
                {isSignUp ? 'Entrar' : 'Criar conta'}
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
