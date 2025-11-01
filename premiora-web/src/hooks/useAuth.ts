import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook customizado para acessar o contexto de autenticação
 * Fornece acesso aos métodos e estado de autenticação da aplicação
 *
 * @returns Objeto com estado e métodos de autenticação
 * @throws Error se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
