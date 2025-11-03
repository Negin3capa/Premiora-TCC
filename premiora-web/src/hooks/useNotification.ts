import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import type { NotificationContextType } from '../types/notification';

/**
 * Hook personalizado para acesso ao contexto de notificações
 * Fornece acesso centralizado às funções de gerenciamento de notificações
 *
 * @returns Contexto de notificações com todas as funções disponíveis
 * @throws Error se usado fora do NotificationProvider
 *
 * @example
 * ```typescript
 * const { showSuccess, showError, notifications } = useNotification();
 *
 * // Mostrar notificação de sucesso
 * showSuccess('Operação realizada!', 'Os dados foram salvos com sucesso.');
 *
 * // Mostrar notificação de erro
 * showError('Erro ao salvar', 'Verifique sua conexão com a internet.');
 *
 * // Acessar lista de notificações ativas
 * console.log('Notificações ativas:', notifications.length);
 * ```
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }

  return context;
};
