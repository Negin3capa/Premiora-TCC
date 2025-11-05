/**
 * ProfileSetupGuard - Componente que força a conclusão do setup de perfil
 * Impede que usuários com perfis incompletos naveguem para outras rotas
 * Bloqueia fechamento da aba/janela durante o setup
 */
import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  shouldForceProfileSetup,
  isSetupLocked,
  setSetupLock,
  clearSetupLock
} from '../../utils/profileUtils';

interface ProfileSetupGuardProps {
  children: React.ReactNode;
  requireComplete?: boolean; // Se true, força redirecionamento para setup se perfil incompleto
}

/**
 * Componente guard que protege rotas que requerem perfil completo
 * Redireciona usuários com perfis incompletos de volta ao setup
 *
 * @param children - Componentes filhos a serem renderizados se perfil estiver completo
 * @param requireComplete - Se true, força redirecionamento para setup se incompleto
 */
const ProfileSetupGuard: React.FC<ProfileSetupGuardProps> = ({
  children,
  requireComplete = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, loading } = useAuth();

  /**
   * Handler para prevenir fechamento da aba/janela
   */
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!user || !userProfile) return;

    // Se deve forçar setup, prevenir fechamento
    if (shouldForceProfileSetup(user, userProfile)) {
      e.preventDefault();
      e.returnValue = 'Você precisa completar seu perfil antes de sair. Tem certeza que deseja fechar?';
      return e.returnValue;
    }
  }, [user, userProfile]);

  /**
   * Handler para prevenir navegação programática
   */
  const handleNavigationAttempt = useCallback(() => {
    if (!user || !userProfile || loading) return;

    // Se está em uma rota que requer perfil completo e perfil está incompleto
    if (requireComplete && shouldForceProfileSetup(user, userProfile)) {
      console.log('🚫 Tentativa de acesso negada - perfil incompleto, redirecionando para setup');

      // Bloquear setup se ainda não estiver bloqueado
      if (!isSetupLocked(user.id)) {
        setSetupLock(user.id, true);
      }

      // Forçar redirecionamento para setup
      if (location.pathname !== '/setup') {
        navigate('/setup', { replace: true });
      }
    }
  }, [user, userProfile, loading, requireComplete, location.pathname, navigate]);

  // Efeito para gerenciar bloqueio do setup
  useEffect(() => {
    if (loading || !user) return;

    const needsSetup = shouldForceProfileSetup(user, userProfile);

    if (needsSetup) {
      // Bloquear setup
      setSetupLock(user.id, true);
      console.log('🔒 Setup bloqueado para usuário:', user.id);
    } else {
      // Desbloquear setup se perfil estiver completo
      clearSetupLock(user.id);
      console.log('🔓 Setup desbloqueado para usuário:', user.id);
    }
  }, [user, userProfile, loading]);

  // Efeito para prevenir fechamento da aba
  useEffect(() => {
    if (!user || !userProfile) return;

    // Adicionar listener apenas se deve forçar setup
    if (shouldForceProfileSetup(user, userProfile)) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      console.log('🛡️ Proteção contra fechamento ativada');

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        console.log('🛡️ Proteção contra fechamento desativada');
      };
    }
  }, [user, userProfile, handleBeforeUnload]);

  // Efeito para verificar navegação
  useEffect(() => {
    handleNavigationAttempt();
  }, [handleNavigationAttempt]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div className="loading-spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--color-border-light)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Verificando perfil...
          </p>
        </div>
      </div>
    );
  }

  // Se requer perfil completo mas está incompleto, não renderizar filhos
  if (requireComplete && shouldForceProfileSetup(user, userProfile)) {
    console.log('🚫 Bloqueando renderização - perfil incompleto');
    return null; // Não renderizar nada, o useEffect vai redirecionar
  }

  // Renderizar filhos se tudo estiver ok
  return <>{children}</>;
};

export default ProfileSetupGuard;
