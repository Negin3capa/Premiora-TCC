import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signUpWithEmail } from '../lib/supabaseAuth';
import '../styles/login.css';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Validação básica de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de username
  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username deve ter pelo menos 3 caracteres';
    if (username.length > 30) return 'Username deve ter no máximo 30 caracteres';
    if (!/^[a-z0-9_]+$/.test(username)) return 'Username deve conter apenas letras minúsculas, números e underscores';
    return null;
  };

  // Função para lidar com o formulário de registro
  const handleSignup = async (e: React.FormEvent) => {
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

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      const result = await signUpWithEmail(email, password, username);

      if (result.error) {
        throw result.error;
      }

      console.log('✅ Registro realizado com sucesso:', result.username);

      // Redirecionar para confirmação de email
      navigate('/email-confirmation');
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);

      // Tratamento específico de erros
      if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (err.message?.includes('username')) {
        setError('Este username já está em uso. Escolha outro.');
      } else {
        setError(err.message || 'Erro no registro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="signup-page-container">
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
          <h1>Criar sua conta</h1>
          <p>Junte-se a milhares de criadores que monetizam seu talento.</p>
        </div>

        <div className="login-content">
          {/* Formulário de registro */}
          <form onSubmit={handleSignup} className="email-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-z0-9_]+$"
                className="form-input"
                title="Apenas letras minúsculas, números e underscores"
              />
              <small style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                Seu @username único (3-30 caracteres, apenas letras minúsculas, números e _)
              </small>
            </div>

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
              <small style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                Mínimo 6 caracteres
              </small>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="email-login-button"
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Separador */}
          <div className="divider">
            <span>ou</span>
          </div>

          {/* Botão Google */}
          <button
            onClick={() => navigate('/login')}
            disabled={isLoading || loading}
            className="google-login-button"
            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Já tem uma conta? Entrar
          </button>

          {/* Toggle entre login e registro */}
          <div className="auth-toggle">
            <p>
              Ao criar conta, você concorda com nossos{' '}
              <a href="#" style={{ color: 'var(--color-primary)' }}>Termos de Serviço</a> e{' '}
              <a href="#" style={{ color: 'var(--color-primary)' }}>Política de Privacidade</a>.
            </p>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2025 Premiora. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
