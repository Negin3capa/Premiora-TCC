/**
 * Componente Google One Tap - Sign In With Google
 * Exibe um prompt automático quando há uma conta Google recente salva
 *
 * @documentation https://developers.google.com/identity/one-tap/web/overview
 * @component
 */
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleOneTap } from '../../hooks/useGoogleOneTap';
import { signInWithIdToken } from '../../lib/supabaseAuth';

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
  const navigate = useNavigate();
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
      // Chamar callback customizado se fornecido
      if (onCredentialResponse) {
        onCredentialResponse(response);
      }

      // Autenticar com Supabase usando o ID Token
      const { user, error } = await signInWithIdToken(response.credential);

      if (error) {
        throw error;
      }

      if (user) {
        console.log('✅ Login via Google One Tap realizado com sucesso:', user.email);
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('❌ Erro ao processar credenciais One Tap:', error);
    }
  };

  // Inicializar One Tap
  useEffect(() => {
    if (!isOneTapInitialized && !hasInitializedRef.current && !isLoading) {
      hasInitializedRef.current = true;

      console.log('🚀 Inicializando Google One Tap');

      initializeOneTap({
        callback: handleCredentialResponse,
        auto_select: hasRecentAccount, // Auto-select apenas se tiver conta recente
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
    if (isOneTapInitialized && autoShow) {
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
