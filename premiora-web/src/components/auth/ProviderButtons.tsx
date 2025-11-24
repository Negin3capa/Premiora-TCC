import React, { useState, useEffect } from 'react';
import { signInWithProvider } from '../../lib/supabaseAuth';
import { useGoogleOneTap } from '../../hooks/useGoogleOneTap';
import { supabase } from '../../utils/supabaseClient';
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
  /** Email para verificar conflitos de provedores */
  email?: string;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para botões de login com provedores OAuth
 * Suporta Google e Facebook com tratamento de erros e loading states
 * Bloqueia Facebook se o usuário já tiver Google com o mesmo email
 *
 * @component
 */
const ProviderButtons: React.FC<ProviderButtonsProps> = ({
  onSuccess,
  onError,
  showOnlyGoogle = false,
  showOnlyFacebook = false,
  providers = ['google', 'facebook'],
  email,
  className = ''
}) => {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [blockedProviders, setBlockedProviders] = useState<Set<OAuthProvider>>(new Set());

  // Hook para gerenciar Google One Tap
  const { hasRecentAccount, lastGoogleAccount } = useGoogleOneTap();

  // Verificar se o usuário já fez login com Google alguma vez
  const hasGoogleLoginHistory = localStorage.getItem('hasGoogleLoginHistory') === 'true';

  // Google One Tap só deve ser mostrado se:
  // 1. O usuário já logou com Google ao menos uma vez
  // 2. Há dados recentes da conta salvos
  const shouldShowGoogleOneTap = hasGoogleLoginHistory && hasRecentAccount && !!lastGoogleAccount;

  // 🔒 VERIFICAR PROTEÇÃO DE IDENTIDADE PATREON-LIKE
  useEffect(() => {
    const checkProviders = async () => {
      if (email) {
        try {
          console.log('🔍 Verificando proteção de identidade para UI dos botões OAuth...');

          // Para verificações na UI, não temos dados de identidade reais
          // Apenas verificamos se haveria bloqueios baseado no email
          console.log('⚠️ Verificação preemptiva de conflitos desabilitada para UI - será feita no callback');

          // Por enquanto, não bloqueamos providers na UI
          // A proteção real acontece no AuthCallback após completar OAuth
          setBlockedProviders(new Set());



        } catch (error) {
          console.error('❌ Erro ao verificar proteção de identidade:', error);
          setBlockedProviders(new Set());
        }
      } else {
        setBlockedProviders(new Set());
      }
    };

    checkProviders();
  }, [email]);

  // Filtrar provedores baseado nas props e conflitos
  const displayProviders = providers.filter(provider => {
    if (showOnlyGoogle && provider !== 'google') return false;
    if (showOnlyFacebook && provider !== 'facebook') return false;
    if (blockedProviders.has(provider)) return false;
    return true;
  });

  // Handler para login com provedor
  const handleProviderLogin = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);

      // Para Google, tentar usar popup para melhor UX
      if (provider === 'google') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
            redirectTo: window.location.origin, // Redirecionar para a origem (vai carregar a app e processar o hash)
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });

        if (error) throw error;

        if (data?.url) {
          // Abrir popup
          const width = 500;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          
          const popup = window.open(
            data.url,
            'google-auth',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
          );

          if (popup) {
            // Monitorar popup para fechar quando voltar para a origem
            const timer = setInterval(() => {
              try {
                if (popup.closed) {
                  clearInterval(timer);
                  setLoadingProvider(null);
                  return;
                }

                // Tentar acessar location (só funciona se estiver na mesma origem)
                const currentUrl = popup.location.href;
                if (currentUrl.includes(window.location.origin)) {
                  // Estamos de volta! O AuthContext na popup vai processar o login
                  
                  // Verificar se há hash na URL (indica que o Supabase retornou tokens)
                  if (currentUrl.includes('#access_token') || currentUrl.includes('code=')) {
                    console.log('✅ Popup recebeu tokens, processando...');
                    
                    // Parar o timer principal para iniciar polling de sessão dedicado
                    clearInterval(timer);

                    // Polling agressivo para detectar a sessão o mais rápido possível
                    const sessionCheckTimer = setInterval(async () => {
                      try {
                        // Tentar forçar atualização da sessão na janela principal
                        const { data } = await supabase.auth.getSession();
                        if (data.session) {
                          console.log('✅ Sessão detectada na janela principal, fechando popup imediatamente');
                          popup.close();
                          clearInterval(sessionCheckTimer);
                          onSuccess?.();
                        }
                      } catch (e) {
                        // Ignorar erros temporários
                      }
                    }, 100); // Verificar a cada 100ms

                    // Timeout de segurança para parar o polling se demorar muito (5s)
                    setTimeout(() => clearInterval(sessionCheckTimer), 5000);
                  }
                }
              } catch (e) {
                // Cross-origin, ignorar
              }
            }, 500);
            
            return; // Retornar para manter loading state até o popup fechar ou detectar login
          }
        }
      }

      // Fallback para redirect padrão (ou para outros providers)
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

        // Botão especial para Google com conta recente - Estilo Patreon (apenas se usuário já logou com Google antes)
        if (provider === 'google' && shouldShowGoogleOneTap) {
          return (
            <button
              key={provider}
              onClick={() => handleProviderLogin(provider)}
              disabled={isLoading || loadingProvider !== null}
              className={`${config.className} google-recent-account`}
              type="button"
            >
              {/* Avatar da conta */}
              {lastGoogleAccount.picture ? (
                <img
                  src={lastGoogleAccount.picture}
                  alt={`Avatar de ${lastGoogleAccount.name || lastGoogleAccount.email}`}
                  className="google-recent-account-avatar"
                  style={{
                    opacity: isLoading ? 0.5 : 1
                  }}
                />
              ) : (
                <div
                  className="google-recent-account-avatar"
                  style={{
                    background: '#dadce0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {(lastGoogleAccount.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Área de texto */}
              <div className="google-recent-account-meta">
                <div className="continue-text">
                  {isLoading ? `Conectando...` : `Continuar como ${lastGoogleAccount.name || lastGoogleAccount.email.split('@')[0]}`}
                </div>
                <div className="account-email">
                  {lastGoogleAccount.email}
                  {/* Caret dropdown */}
                  <span className="google-recent-account-caret"></span>
                </div>
              </div>

              {/* Ícone do Google */}
              <img
                src={config.icon}
                alt={config.alt}
                className={`${provider}-icon google-recent-account-provider`}
                style={{
                  opacity: isLoading ? 0.5 : 1
                }}
              />
            </button>
          );
        }

        // Botão padrão para outros provedores
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
