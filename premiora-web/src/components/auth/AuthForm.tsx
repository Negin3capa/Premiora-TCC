import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../../lib/supabaseAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Propriedades do componente AuthForm
 */
interface AuthFormProps {
  /** Modo do formulário: login ou signup */
  mode: 'login' | 'signup';
  /** Callback opcional chamado após sucesso */
  onSuccess?: () => void;
  /** Callback opcional chamado em caso de erro */
  onError?: (error: string) => void;
  /** Se deve redirecionar automaticamente após sucesso */
  redirectOnSuccess?: boolean;
}

/**
 * Componente reutilizável para formulários de autenticação
 * Suporta tanto login quanto registro com email/senha
 *
 * @component
 */
const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSuccess,
  onError,
  redirectOnSuccess = true
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validação básica de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de username (apenas para signup)
  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username deve ter pelo menos 3 caracteres';
    if (username.length > 30) return 'Username deve ter no máximo 30 caracteres';
    if (!/^[a-z0-9_]+$/.test(username)) return 'Username deve conter apenas letras minúsculas, números e underscores';
    return null;
  };

  // Handler do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação frontend
    if (!validateEmail(email)) {
      const errorMsg = 'Por favor, insira um email válido.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (password.length < 6) {
      const errorMsg = 'A senha deve ter pelo menos 6 caracteres.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (mode === 'signup') {
      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        onError?.(usernameError);
        return;
      }
    }

    try {
      setError('');
      setIsLoading(true);

      if (mode === 'signup') {
        const result = await signUpWithEmail(email, password, username);

        if (result.error) {
          throw result.error;
        }

        console.log('✅ Registro realizado com sucesso:', result.username);

        onSuccess?.();

        if (redirectOnSuccess) {
          navigate('/email-confirmation');
        }
      } else {
        const result = await signInWithEmail(email, password);

        if (result.error) {
          throw result.error;
        }

        console.log('✅ Login realizado com sucesso');

        onSuccess?.();

        if (redirectOnSuccess) {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error(`❌ Erro no ${mode}:`, err);

      let errorMsg = '';
      if (err.message?.includes('User already registered')) {
        errorMsg = 'Este email já está cadastrado. Tente fazer login.';
      } else if (err.message?.includes('Invalid login credentials')) {
        errorMsg = 'Email ou senha incorretos.';
      } else if (err.message?.includes('username')) {
        errorMsg = 'Este username já está em uso. Escolha outro.';
      } else {
        errorMsg = err.message || `Erro no ${mode}. Tente novamente.`;
      }

      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <form onSubmit={handleSubmit} className="email-form">
      {isSignup && (
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
      )}

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
        disabled={isLoading}
        className="email-login-button"
      >
        {isLoading ? (isSignup ? 'Criando conta...' : 'Entrando...') : (isSignup ? 'Criar Conta' : 'Entrar')}
      </button>
    </form>
  );
};

export default AuthForm;
