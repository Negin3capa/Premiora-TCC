/**
 * Tipos relacionados ao sistema de notificações/toasts
 */

/**
 * Tipos de notificação disponíveis
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Estrutura de uma notificação individual
 */
export interface Notification {
  /** ID único da notificação */
  id: string;
  /** Tipo da notificação */
  type: NotificationType;
  /** Título da notificação */
  title: string;
  /** Mensagem da notificação */
  message?: string;
  /** Duração em milissegundos (opcional, padrão: 5000ms) */
  duration?: number;
  /** Se a notificação pode ser fechada manualmente */
  dismissible?: boolean;
  /** Ação customizada (opcional) */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Estado global do sistema de notificações
 */
export interface NotificationContextState {
  /** Lista de notificações ativas */
  notifications: Notification[];
}

/**
 * Ações disponíveis para gerenciamento de notificações
 */
export interface NotificationActions {
  /** Adiciona uma nova notificação */
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  /** Remove uma notificação específica */
  removeNotification: (id: string) => void;
  /** Remove todas as notificações */
  clearAllNotifications: () => void;
  /** Mostra uma notificação de sucesso */
  showSuccess: (title: string, message?: string, duration?: number) => string;
  /** Mostra uma notificação de erro */
  showError: (title: string, message?: string, duration?: number) => string;
  /** Mostra uma notificação de aviso */
  showWarning: (title: string, message?: string, duration?: number) => string;
  /** Mostra uma notificação informativa */
  showInfo: (title: string, message?: string, duration?: number) => string;
}

/**
 * Interface completa do contexto de notificações
 */
export interface NotificationContextType extends NotificationContextState, NotificationActions {}

/**
 * Configuração padrão para notificações
 */
export const DEFAULT_NOTIFICATION_CONFIG = {
  duration: 5000, // 5 segundos
  dismissible: true,
} as const;
