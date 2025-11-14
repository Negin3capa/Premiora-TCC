import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProviderButtons } from '../components/auth';
import { signInWithEmail, signUpWithEmail } from '../lib/supabaseAuth';
import { supabase } from '../utils/supabaseClient';
import '../styles/login.css';

/**
 * Página de Login da aplicação Premiora
 * Permite login e cadastro unificado com email/senha e provedores OAuth
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  // Estados para o fluxo unificado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'email' | 'login' | 'signup'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Verificar se o email já está cadastrado
  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      return false;
    }
  };

  // Handler para continuar após inserir email
  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const emailExists = await checkEmailExists(email);

      if (emailExists) {
        setStep('login');
      } else {
        setStep('signup');
      }
    } catch (err) {
      setError('Erro ao verificar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithEmail(email, password);

      if (result.error) {
        throw result.error;
      }

      console.log('✅ Login realizado com sucesso');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('❌ Erro no login:', err);

      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else {
        setError(err.message || 'Erro no login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para cadastro
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (!displayName.trim()) {
      setError('Nome de exibição é obrigatório.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signUpWithEmail(email, password, username);

      if (result.error) {
        throw result.error;
      }

      // Atualizar o nome de exibição no perfil
      if (result.user) {
        await supabase
          .from('users')
          .update({ name: displayName })
          .eq('id', result.user.id);
      }

      console.log('✅ Registro realizado com sucesso:', result.username);
      navigate('/email-confirmation');
    } catch (err: any) {
      console.error('❌ Erro no registro:', err);

      if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
        setStep('login');
      } else if (err.message?.includes('username')) {
        setError('Este username já está em uso. Escolha outro.');
      } else {
        setError(err.message || 'Erro no registro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Voltar para o passo anterior
  const handleBack = () => {
    setStep('email');
    setPassword('');
    setUsername('');
    setDisplayName('');
    setError('');
  };

  // Handlers para provedores OAuth
  const handleProviderSuccess = () => {
    console.log('✅ Login com provedor iniciado');
  };

  const handleProviderError = (errorMsg: string) => {
    console.error('❌ Erro no login com provedor:', errorMsg);
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
      </div>

      <div className="login-header">
        <h1 className={step === 'email' ? 'centered-title' : ''}>{step === 'email' ? 'Bem-vindo' : step === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p>
          {step === 'email' && 'Entre com seu email ou cadastre-se agora.'}
          {step === 'login' && 'Digite sua senha para continuar.'}
          {step === 'signup' && 'Complete seu cadastro para começar.'}
        </p>
      </div>

      <div className="login-content">
        {step === 'email' && (
          <>
            {/* Formulário de email */}
            <form onSubmit={handleEmailContinue} className="email-form">
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

              {error && <p className="error-message">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="email-login-button"
              >
                {isLoading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>

            {/* Separador */}
            <div className="divider">
              <span>ou</span>
            </div>

            {/* Botões de provedores OAuth */}
            <ProviderButtons
              onSuccess={handleProviderSuccess}
              onError={handleProviderError}
              email={email}
            />
          </>
        )}

        {step === 'login' && (
          <>
            {/* Formulário de login */}
            <form onSubmit={handleLogin} className="email-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  disabled
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

              <button
                type="submit"
                disabled={isLoading}
                className="email-login-button"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="back-button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                ← Voltar
              </button>
            </form>
          </>
        )}

        {step === 'signup' && (
          <>
            {/* Formulário de cadastro */}
            <form onSubmit={handleSignup} className="email-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  disabled
                  className="form-input"
                />
              </div>

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
                  type="text"
                  placeholder="Nome de exibição"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
                disabled={isLoading}
                className="email-login-button"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="back-button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>

      <div className="login-footer">
        <p>Ao continuar, você concorda com nossos <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.</p>
      </div>
    </div>
  );
};

export default Login;
