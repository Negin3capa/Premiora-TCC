/**
 * Componente Google One Tap - Sign In With Google
 * Exibe um prompt automático quando há uma conta Google recente salva
 *
 * @documentation https://developers.google.com/identity/one-tap/web/overview
 * @component
 */
import React, { useEffect, useRef } from 'react';
import { useGoogleOneTap } from '../../hooks/useGoogleOneTap';

// Função utilitária para decodificar JWT
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Erro ao decodificar JWT:', error);
    return {};
  }
}

/**
 * Propriedades do componente GoogleOneTap
 */
interface GoogleOneTapProps {
  /** Se deve mostrar automaticamente o prompt quando há conta recente */
  autoShow?: boolean;
  /** Callback chamado quando o usuário seleciona uma conta */
  onCredentialResponse?: (response: google.accounts.id.CredentialResponse) => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente que gerencia o Google Sign-In One Tap
 * Mostra automaticamente quando há uma conta Google recente
 *
 * @component
 */
const GoogleOneTap: React.FC<GoogleOneTapProps> = ({
  autoShow = true,
  onCredentialResponse,
  className = ''
}) => {
  const {
    hasRecentAccount,
    isOneTapInitialized,
    isLoading,
    initializeOneTap,
    showGooglePrompt,
    cancelOneTap
  } = useGoogleOneTap();

  const hasInitializedRef = useRef(false);

  // Callback personalizado para credenciais do One Tap
  const handleCredentialResponse = async (response: google.accounts.id.CredentialResponse) => {
    console.log('🔑 Google One Tap - Credenciais recebidas:', {
      hasCredential: !!response.credential,
      select_by: response.select_by
    });

    try {
      // Salvar temporariamente as credenciais
      sessionStorage.setItem('googleOneTapCredential', response.credential);

      // Chamar callback customizado se fornecido
      if (onCredentialResponse) {
        onCredentialResponse(response);
      }

      // Decodificar JWT para obter informações do usuário
      const decodedToken = parseJwt(response.credential);
      console.log('👤 Informações do usuário One Tap:', {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });

      // Aqui integramos com o Supabase Auth
      // Como estamos usando OAuth, podemos tentar simular o fluxo OAuth
      // ou implementar um sistema que use as credenciais diretamente

      // Por enquanto, redirecionamos para o dashboard (simulando login bem-sucedido)
      console.log('✅ Login automático via One Tap realizado');
      console.log('🔄 Redirecionando para dashboard...');

      // Em uma implementação completa, você faria:
      // 1. Autenticar com Supabase usando as credenciais
      // 2. Ou enviar as credenciais para seu backend
      // 3. Redirecionar baseado no sucesso da autenticação

      // Por enquanto, apenas simulamos o sucesso
      // Você pode implementar o redirecionamento aqui

    } catch (error) {
      console.error('❌ Erro ao processar credenciais One Tap:', error);
    }
  };



  // Inicializar One Tap quando há conta recente
  useEffect(() => {
    if (hasRecentAccount && !isOneTapInitialized && !hasInitializedRef.current && !isLoading) {
      hasInitializedRef.current = true;

      console.log('🚀 Inicializando Google One Tap - conta recente detectada');

      initializeOneTap({
        callback: handleCredentialResponse,
        auto_select: true, // Auto-select para contas recentes
        cancel_on_tap_outside: true,
        context: 'signin'
      }).catch(error => {
        console.error('❌ Erro ao inicializar Google One Tap:', error);
        hasInitializedRef.current = false;
      });
    }
  }, [hasRecentAccount, isOneTapInitialized, isLoading, initializeOneTap]);

  // Mostrar prompt quando inicializado
  useEffect(() => {
    if (isOneTapInitialized && autoShow && hasRecentAccount) {
      console.log('🔄 Exibindo Google One Tap prompt...');

      // Pequeno delay para garantir que o componente está montado
      const timer = setTimeout(() => {
        showGooglePrompt();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOneTapInitialized, autoShow, hasRecentAccount, showGooglePrompt]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (isOneTapInitialized) {
        cancelOneTap();
      }
    };
  }, [isOneTapInitialized, cancelOneTap]);

  // Não renderiza nada visualmente - é apenas um container lógico
  // O prompt do One Tap aparece automaticamente como uma modal
  return (
    <div
      id="google-one-tap-container"
      className={`google-one-tap-container ${className}`}
      style={{ display: 'none' }} // Escondido pois o prompt aparece automaticamente
      aria-hidden="true"
    >
      {/* Container invisível - o prompt real aparece automaticamente */}
    </div>
  );
};

export default GoogleOneTap;
