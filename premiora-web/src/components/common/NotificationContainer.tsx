import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import type { NotificationType } from '../../types/notification';
import '../../styles/notifications.css';

/**
 * Componente NotificationContainer
 * Container global para exibir notificações/toasts da aplicação
 */
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  /**
   * Retorna o ícone apropriado para o tipo de notificação
   */
  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  /**
   * Retorna as classes CSS para o tipo de notificação
   */
  const getNotificationClasses = (type: NotificationType): string => {
    return `notification notification-${type}`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClasses(notification.type)}
          role="alert"
          aria-live="assertive"
        >
          {/* Ícone da notificação */}
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Conteúdo da notificação */}
          <div className="notification-content">
            <div className="notification-title">
              {notification.title}
            </div>
            {notification.message && (
              <div className="notification-message">
                {notification.message}
              </div>
            )}
          </div>

          {/* Ações da notificação */}
          <div className="notification-actions">
            {notification.action && (
              <button
                className="notification-action-button"
                onClick={notification.action.onClick}
                aria-label={notification.action.label}
              >
                {notification.action.label}
              </button>
            )}

            {notification.dismissible !== false && (
              <button
                className="notification-close-button"
                onClick={() => removeNotification(notification.id)}
                aria-label="Fechar notificação"
              >
                ✕
              </button>
            )}
          </div>

          {/* Barra de progresso para notificações com timer */}
          {notification.duration && notification.duration > 0 && (
            <div
              className="notification-progress"
              style={{
                animationDuration: `${notification.duration}ms`
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
