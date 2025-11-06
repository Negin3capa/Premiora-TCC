/**
 * Página de notificações
 * Exibe todas as notificações do usuário
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, Header, MobileBottomBar } from '../components/layout';
import '../styles/HomePage.css';

/**
 * Página de notificações do usuário
 * Mostra lista de notificações com filtros e ações
 */
const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /**
   * Handler para alternar visibilidade da sidebar em dispositivos móveis
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Mock notifications data
  const mockNotifications = [
    {
      id: '1',
      type: 'like' as const,
      title: 'João curtiu seu post',
      message: '"Como criar aplicações React modernas"',
      timestamp: '2h atrás',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format'
    },
    {
      id: '2',
      type: 'comment' as const,
      title: 'Maria comentou em seu vídeo',
      message: '"Excelente explicação sobre hooks!"',
      timestamp: '4h atrás',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b60d0de9?w=40&h=40&fit=crop&crop=face&auto=format'
    },
    {
      id: '3',
      type: 'follow' as const,
      title: 'Carlos começou a te seguir',
      message: '',
      timestamp: '1d atrás',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format'
    },
    {
      id: '4',
      type: 'community' as const,
      title: 'Nova comunidade: Tecnologia',
      message: 'Você foi convidado para participar',
      timestamp: '2d atrás',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=40&h=40&fit=crop&crop=center&auto=format'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'community': return '🏘️';
      default: return '🔔';
    }
  };

  return (
    <div className="homepage">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onToggleSidebar={toggleSidebar}
        />

        <div className="feed">
          <div className="feed-content">
            <div className="notifications-header">
              <h1 className="page-title">Notificações</h1>
              <p className="page-subtitle">
                Fique por dentro das atividades da sua rede
              </p>
            </div>

            <div className="notifications-container">
              {mockNotifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <h3>Nenhuma notificação</h3>
                  <p>Quando alguém interagir com seu conteúdo, você verá aqui.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-avatar">
                        <img
                          src={notification.avatar}
                          alt="Avatar"
                          className="avatar-image"
                        />
                        <div className="notification-type-icon">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className="notification-content">
                        <div className="notification-text">
                          <span className="notification-title">{notification.title}</span>
                          {notification.message && (
                            <span className="notification-message"> {notification.message}</span>
                          )}
                        </div>
                        <div className="notification-meta">
                          <span className="notification-time">{notification.timestamp}</span>
                          {!notification.read && (
                            <span className="unread-indicator"></span>
                          )}
                        </div>
                      </div>

                      <div className="notification-actions">
                        <button className="action-button" title="Mais opções">
                          ⋯
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MobileBottomBar />
    </div>
  );
};

export default NotificationsPage;
