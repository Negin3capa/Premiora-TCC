import React, { createContext, useCallback, useState, useEffect } from 'react';
import type {
  NotificationContextType,
  Notification
} from '../types/notification';
import { DEFAULT_NOTIFICATION_CONFIG } from '../types/notification';

/**
 * Contexto para gerenciamento centralizado de notificações/toasts
 * Centraliza estado e ações de notificações através da aplicação
 */
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider de notificações que gerencia estado global de notificações
 * Centraliza abertura, fechamento e gerenciamento de notificações através da aplicação
 *
 * @component
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Gera um ID único para uma notificação
   */
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Adiciona uma nova notificação ao estado
   * @param notification - Notificação sem ID (será gerado automaticamente)
   * @returns ID da notificação criada
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      duration: DEFAULT_NOTIFICATION_CONFIG.duration,
      dismissible: DEFAULT_NOTIFICATION_CONFIG.dismissible,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, [generateId]);

  /**
   * Remove uma notificação específica
   * @param id - ID da notificação a ser removida
   */
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Remove todas as notificações
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Mostra uma notificação de sucesso
   * @param title - Título da notificação
   * @param message - Mensagem opcional
   * @param duration - Duração opcional em ms
   * @returns ID da notificação criada
   */
  const showSuccess = useCallback((title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  /**
   * Mostra uma notificação de erro
   * @param title - Título da notificação
   * @param message - Mensagem opcional
   * @param duration - Duração opcional em ms
   * @returns ID da notificação criada
   */
  const showError = useCallback((title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  /**
   * Mostra uma notificação de aviso
   * @param title - Título da notificação
   * @param message - Mensagem opcional
   * @param duration - Duração opcional em ms
   * @returns ID da notificação criada
   */
  const showWarning = useCallback((title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  /**
   * Mostra uma notificação informativa
   * @param title - Título da notificação
   * @param message - Mensagem opcional
   * @param duration - Duração opcional em ms
   * @returns ID da notificação criada
   */
  const showInfo = useCallback((title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [addNotification]);

  // Efeito para gerenciar auto-remocão de notificações com timer
  useEffect(() => {
    const timers = notifications
      .filter(notification => notification.duration && notification.duration > 0)
      .map(notification => {
        return setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
      });

    // Limpa timers quando notificações mudam
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, removeNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
