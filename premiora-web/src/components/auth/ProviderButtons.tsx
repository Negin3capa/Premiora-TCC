import React, { useState } from 'react';
import { signInWithProvider } from '../../lib/supabaseAuth';
import type { OAuthProvider } from '../../lib/supabaseAuth';

/**
 * Propriedades do componente ProviderButtons
 */
interface ProviderButtonsProps {
  /** Callback opcional chamado após sucesso */
  onSuccess?: () => void;
  /** Callback opcional chamado em caso de erro */
  onError?: (error: string) => void;
  /** Se deve mostrar apenas Google */
  showOnlyGoogle?: boolean;
  /** Se deve mostrar apenas Facebook */
  showOnlyFacebook?: boolean;
  /** Provedores customizados a mostrar */
  providers?: OAuthProvider[];
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para botões de login com provedores OAuth
 * Suporta Google e Facebook com tratamento de erros e loading states
 *
 * @component
 */
const ProviderButtons: React.FC<ProviderButtonsProps> = ({
  onSuccess,
  onError,
  showOnlyGoogle = false,
  showOnlyFacebook = false,
  providers = ['google', 'facebook'],
  className = ''
}) => {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  // Filtrar provedores baseado nas props
  const displayProviders = providers.filter(provider => {
    if (showOnlyGoogle && provider !== 'google') return false;
    if (showOnlyFacebook && provider !== 'facebook') return false;
    return true;
  });

  // Handler para login com provedor
  const handleProviderLogin = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);

      const result = await signInWithProvider(provider);

      if (result.error) {
        throw result.error;
      }

      console.log(`✅ Login ${provider} iniciado com sucesso`);
      onSuccess?.();

      // O redirecionamento será feito pelo Supabase para /auth/callback
    } catch (err: any) {
      console.error(`❌ Erro no login ${provider}:`, err);

      const errorMsg = err.message || `Erro ao fazer login com ${provider === 'google' ? 'Google' : 'Facebook'}. Tente novamente.`;
      onError?.(errorMsg);
    } finally {
      setLoadingProvider(null);
    }
  };

  // Configuração dos provedores
  const providerConfig = {
    google: {
      name: 'Google',
      icon: 'https://developers.google.com/identity/images/g-logo.png',
      className: 'google-login-button',
      alt: 'Google'
    },
    facebook: {
      name: 'Facebook',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      className: 'facebook-login-button',
      alt: 'Facebook'
    }
  };

  if (displayProviders.length === 0) {
    return null;
  }

  return (
    <div className={`provider-buttons ${className}`}>
      {displayProviders.map(provider => {
        const config = providerConfig[provider];
        const isLoading = loadingProvider === provider;

        return (
          <button
            key={provider}
            onClick={() => handleProviderLogin(provider)}
            disabled={isLoading || loadingProvider !== null}
            className={config.className}
            type="button"
          >
            <img
              src={config.icon}
              alt={config.alt}
              className={`${provider}-icon`}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '8px',
                opacity: isLoading ? 0.5 : 1
              }}
            />
            {isLoading ? `Conectando com ${config.name}...` : `Entrar com ${config.name}`}
          </button>
        );
      })}
    </div>
  );
};

export default ProviderButtons;
