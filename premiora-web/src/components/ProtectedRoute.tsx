/**
 * Componente ProtectedRoute
 * Protege rotas que requerem autenticação, redirecionando usuários não autenticados para login
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper para rotas protegidas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 * 
 * @param children - Componentes filhos a serem renderizados se autenticado
 * @returns Componente filho ou redirecionamento para login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Renderiza o componente protegido
  return <>{children}</>;
};

export default ProtectedRoute;
