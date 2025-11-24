import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useUI';
import { ProviderButtons, GoogleOneTap } from '../components/auth';
import '../styles/login.css';

/**
 * Página de Login da aplicação Premiora
 * Permite login apenas através de provedores OAuth (Google e Facebook)
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loading, user } = useAuth();
  const { isDark } = useTheme();
  const [error, setError] = useState('');

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Handlers para provedores OAuth
  const handleProviderSuccess = () => {
    console.log('✅ Login com provedor iniciado');
    setError('');
  };

  const handleProviderError = (errorMsg: string) => {
    console.error('❌ Erro no login com provedor:', errorMsg);
    setError(errorMsg);
  };

  return (
    <div className="login-page">
      {/* Premium Branding Header */}
      <div className="login-brand">
        <div className="brand-logo">
          <img 
            src={isDark ? "/assets/premiora-logo.png" : "/assets/premiora-logo-light.png"} 
            alt="Premiora" 
          />
          <span>Premiora</span>
        </div>
      </div>

      <div className="login-header">
        <h1>Bem-vindo</h1>
        <p>Entre com sua conta Google ou Facebook para continuar.</p>
      </div>

      <div className="login-content">
        {/* Google One Tap - aparece automaticamente se houver conta recente */}
        <GoogleOneTap />

        {/* Botões de provedores OAuth */}
        <ProviderButtons
          onSuccess={handleProviderSuccess}
          onError={handleProviderError}
        />

        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="login-footer">
        <p>Ao continuar, você concorda com nossos <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.</p>
      </div>
    </div>
  );
};

export default Login;
