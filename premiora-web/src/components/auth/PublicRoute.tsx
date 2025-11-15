/**
 * Componente PublicRoute
 * Protege rotas públicas (landing, login) de usuários já autenticados, redirecionando para /home
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { shouldForceProfileSetup } from '../../utils/profileUtils';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper para rotas públicas que não devem ser acessadas por usuários autenticados
 * Redireciona para /setup se usuário tiver perfil incompleto, ou para /dashboard se completo
 * Aguarda carregamento completo do perfil antes de decidir redirecionamento
 *
 * @param children - Componentes filhos a serem renderizados se não autenticado
 * @returns Componente filho ou redirecionamento baseado no status do perfil
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  // Mostra loading enquanto verifica autenticação ou perfil
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-secondary)'
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
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // Redireciona baseado no status do perfil se estiver autenticado
  if (user) {
    // Se ainda não temos dados do perfil, aguardar um pouco mais
    // Isso evita redirecionamentos incorretos durante carregamento
    if (userProfile === undefined || userProfile === null) {
      console.log('🔄 PublicRoute: Aguardando carregamento do perfil do usuário autenticado...');
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-secondary)'
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
              Carregando seu perfil...
            </p>
          </div>
        </div>
      );
    }

    // Agora temos dados do perfil, verificar se necessita setup
    if (shouldForceProfileSetup(user, userProfile)) {
      console.log('🔄 PublicRoute: Perfil incompleto detectado, redirecionando para setup');
      return <Navigate to="/setup" replace />;
    }

    // Perfil completo, redirecionar para dashboard
    console.log('🔄 PublicRoute: Usuário autenticado com perfil completo, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Renderiza a página pública
  return <>{children}</>;
};

export default PublicRoute;
