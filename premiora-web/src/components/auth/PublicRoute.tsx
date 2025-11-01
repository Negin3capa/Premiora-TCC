/**
 * Componente PublicRoute
 * Protege rotas públicas (landing, login) de usuários já autenticados, redirecionando para /home
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper para rotas públicas que não devem ser acessadas por usuários autenticados
 * Redireciona para /home se o usuário estiver autenticado
 * 
 * @param children - Componentes filhos a serem renderizados se não autenticado
 * @returns Componente filho ou redirecionamento para home
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Mostra loading enquanto verifica autenticação
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
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  // Redireciona para home se estiver autenticado
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Renderiza a página pública
  return <>{children}</>;
};

export default PublicRoute;
