/**
 * Hook personalizado para gerenciar Google One Tap / Sign In With Google
 * Permite identificação automática da última conta Google usada ao fazer logout
 *
 * @documentation https://developers.google.com/identity/one-tap/web/overview
 * @example
 * const { lastGoogleAccount, initializeOneTap, showGooglePrompt } = useGoogleOneTap();
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// Interface para dados da última conta Google salva
interface LastGoogleAccount {
  email: string;
  picture?: string;
  name?: string;
  savedAt: number;
}

// Interface para configuração do Google One Tap
interface OneTapConfig {
  client_id: string;
  callback?: (response: google.accounts.id.CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: 'signin' | 'signup' | 'use';
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
  // FedCM migration: Opt-in to FedCM to prepare for when it becomes mandatory
  use_fedcm_for_prompt?: boolean;
}

// Hook principal
export const useGoogleOneTap = () => {
  const [lastGoogleAccount, setLastGoogleAccount] = useState<LastGoogleAccount | null>(null);
  const [isOneTapInitialized, setIsOneTapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const gsiScriptLoadedRef = useRef(false);

  // Carregar script do Google Identity Services
  const loadGoogleIdentityServices = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // Verificar se já está carregado
      if (window.google?.accounts?.id) {
        console.log('✅ Google Identity Services já carregado');
        resolve();
        return;
      }

      // Verificar se script já foi adicionado
      if (gsiScriptLoadedRef.current) {
        console.log('⏳ Aguardando carregamento do script GSI...');
        const checkGSI = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGSI);
            console.log('✅ Google Identity Services carregado após aguardar');
            resolve();
          }
        }, 100);
        return;
      }

      // Adicionar script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Script Google Identity Services carregado');
        gsiScriptLoadedRef.current = true;
        resolve();
      };

      script.onerror = () => {
        console.error('❌ Falha ao carregar script Google Identity Services');
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }, []);

  // Carregar última conta Google do localStorage
  const loadLastGoogleAccount = useCallback(() => {
    try {
      const stored = localStorage.getItem('lastGoogleAccount');
      if (stored) {
        const account: LastGoogleAccount = JSON.parse(stored);

        // Verificar se não está expirado (7 dias)
        const expiresAt = account.savedAt + (7 * 24 * 60 * 60 * 1000);
        if (Date.now() > expiresAt) {
          localStorage.removeItem('lastGoogleAccount');
          console.log('🗑️ Última conta Google expirada, removida');
          setLastGoogleAccount(null);
          return;
        }

        console.log('📱 Última conta Google carregada:', account.email);
        setLastGoogleAccount(account);
      } else {
        setLastGoogleAccount(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar última conta Google:', error);
      setLastGoogleAccount(null);
    }
  }, []);

  // Limpar dados da última conta Google
  const clearLastGoogleAccount = useCallback(() => {
    localStorage.removeItem('lastGoogleAccount');
    setLastGoogleAccount(null);
    console.log('🗑️ Dados da última conta Google limpos');
  }, []);

  // Callback padrão para processamento das credenciais Google
  const handleCredentialResponse = useCallback(async (response: google.accounts.id.CredentialResponse) => {
    console.log('🔑 Credenciais Google recebidas (One Tap):', {
      hasCredential: !!response.credential,
      select_by: response.select_by
    });

    try {
      // Aqui você poderia redirecionar ou processar as credenciais
      // Por enquanto, apenas logamos
      console.log('🔄 Credencial Google One Tap:', response.credential);

      // Salvar no localStorage para uso posterior se necessário
      sessionStorage.setItem('googleOneTapCredential', response.credential);

    } catch (error) {
      console.error('❌ Erro ao processar credenciais Google One Tap:', error);
    }
  }, []);

  // Inicializar Google One Tap
  const initializeOneTap = useCallback(async (config: Partial<OneTapConfig> = {}) => {
    if (isOneTapInitialized) {
      console.log('⚠️ Google One Tap já inicializado');
      return;
    }

    try {
      setIsLoading(true);

      // Carregar GSI primeiro
      await loadGoogleIdentityServices();

      // Verificar se temos client_id
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn('⚠️ VITE_GOOGLE_CLIENT_ID não configurado, pulando One Tap');
        return;
      }

      // Configuração padrão do One Tap com FedCM habilitado
      const defaultConfig: OneTapConfig = {
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: !!lastGoogleAccount, // Auto-select se temos conta recente
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        // FedCM migration: Opt-in to FedCM to prepare for when it becomes mandatory
        use_fedcm_for_prompt: true
      };

      // Mesclar com configuração passada
      const finalConfig = { ...defaultConfig, ...config };

      console.log('🚀 Inicializando Google One Tap:', {
        hasLastAccount: !!lastGoogleAccount,
        auto_select: finalConfig.auto_select,
        context: finalConfig.context,
        use_fedcm_for_prompt: finalConfig.use_fedcm_for_prompt
      });

      // Inicializar One Tap
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize(finalConfig);
        setIsOneTapInitialized(true);
      } else {
        console.error('❌ Google Identity Services não disponível para inicialização do One Tap');
      }

      console.log('✅ Google One Tap inicializado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao inicializar Google One Tap:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isOneTapInitialized, loadGoogleIdentityServices, lastGoogleAccount, handleCredentialResponse]);

  // Mostrar prompt do One Tap
  const showGooglePrompt = useCallback(() => {
    if (!isOneTapInitialized) {
      console.warn('⚠️ Google One Tap não inicializado, chame initializeOneTap primeiro');
      return;
    }

    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification: google.accounts.id.PromptMomentNotification) => {
          // FedCM migration: Quando FedCM estiver habilitado, os métodos getSkippedReason(),
          // getDismissedReason(), e getNotDisplayedReason() não estarão disponíveis.
          // O código atual já trata estes métodos como opcionais nas interfaces globais.

          console.log('🔔 Notificação One Tap:', {
            isDisplayed: notification.isDisplayed,
            isHidden: notification.isHidden,
            isSkipped: notification.isSkipped,
            isDismissed: notification.isDismissed,
            // FedCM migration: Não chame estes métodos quando usar_fedcm_for_prompt estiver true
            // dismissedReason: notification.getDismissedReason?.(),
            // notDisplayedReason: notification.getNotDisplayedReason?.(),
            // skippedReason: notification.getSkippedReason?.(),
          });
        });
      }

      console.log('🔄 Prompt Google One Tap exibido');
    } catch (error) {
      console.error('❌ Erro ao mostrar prompt Google One Tap:', error);
    }
  }, [isOneTapInitialized]);

  // Cancelar One Tap existente
  const cancelOneTap = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
      console.log('🛑 Google One Tap cancelado');
    }
  }, []);

  // Efeito para carregar dados salvos na inicialização
  useEffect(() => {
    loadLastGoogleAccount();
  }, [loadLastGoogleAccount]);

  // Efeito para recarregar quando o componente desmonta/monta
  useEffect(() => {
    return () => {
      if (isOneTapInitialized && window.google?.accounts?.id) {
        cancelOneTap();
      }
    };
  }, [isOneTapInitialized, cancelOneTap]);

  return {
    // Estado
    lastGoogleAccount,
    isOneTapInitialized,
    isLoading,

    // Métodos
    initializeOneTap,
    showGooglePrompt,
    clearLastGoogleAccount,
    cancelOneTap,
    loadLastGoogleAccount,

    // Utilitários
    hasRecentAccount: !!lastGoogleAccount && (Date.now() - lastGoogleAccount.savedAt < 7 * 24 * 60 * 60 * 1000)
  };
};

// Tipos globais para TypeScript (extendendo window)
declare global {
  namespace google {
    namespace accounts {
      namespace id {
        interface CredentialResponse {
          credential: string;
          select_by: string;
        }

        interface IdConfiguration {
          client_id: string;
          callback?: (response: CredentialResponse) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          prompt_parent_id?: string;
          nonce?: string;
          context?: 'signin' | 'signup' | 'use';
          state_cookie_domain?: string;
          ux_mode?: 'popup' | 'redirect';
          allowed_parent_origin?: string | string[];
          intermediate_iframe_close_callback?: () => void;
          // FedCM migration: Opt-in to FedCM to prepare for when it becomes mandatory
          use_fedcm_for_prompt?: boolean;
        }

        interface PromptMomentNotification {
          isDisplayed: boolean;
          isHidden: boolean;
          isSkipped: boolean;
          isDismissed: boolean;
          getDismissedReason?: () => string;
          getNotDisplayedReason?: () => string;
          getSkippedReason?: () => string;
        }

        interface ButtonOptions {
          type?: 'standard' | 'icon';
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signup_with_google';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
          logo_alignment?: 'left' | 'center';
          width?: string;
          locale?: string;
        }
      }
    }
  }

  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: google.accounts.id.IdConfiguration) => void;
          prompt: (momentListener?: (notification: google.accounts.id.PromptMomentNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: google.accounts.id.ButtonOptions) => void;
          cancel: () => void;
        };
      };
    };
  }
}
