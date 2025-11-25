import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NotificationService } from '../services/NotificationService';
import { NotificationItem } from '../components/notifications/NotificationItem';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import RightSidebar from '../components/dashboard/RightSidebar';
import MobileBottomBar from '../components/layout/MobileBottomBar';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import type { SocialNotification } from '../types/socialNotification';
import '../styles/HomePage.css';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'mentions'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchNotifications = async (page: number) => {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const newNotifications = await NotificationService.getNotifications(limit, offset);
      
      if (newNotifications.length < limit) {
        setHasMore(false);
      }

      setNotifications(prev => page === 1 ? newNotifications : [...prev, ...newNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const { sentinelRef, showLoadingRow } = useInfiniteScroll(hasMore, loading, () => {
    const nextPage = Math.ceil(notifications.length / 20) + 1;
    fetchNotifications(nextPage);
  });

  useEffect(() => {
    fetchNotifications(1);
    
    // Subscribe to realtime updates
    const subscription = NotificationService.subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar - Fixed Position */}
      <div className="dashboard-sidebar">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main-content">
        <Header 
          className="dashboard-header" 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          showNotificationTabs={true}
          activeNotificationTab={activeTab}
          onNotificationTabChange={setActiveTab}
        />
        <div className="dashboard-layout">
          
          {/* Feed Container */}
          <div className="dashboard-feed-container">
            <main className="feed">
              <div className="feed-layout">
                <div className="feed-main">
                  <div className="feed-content">
                    
                    {/* Notifications List */}
                    <div className="content-grid">
                      {loading && notifications.length === 0 ? (
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="empty-state">
                          <p>Nenhuma notificação ainda</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))
                      )}
                      
                      {/* Loading Row */}
                      {showLoadingRow && (
                        <div className="feed-loading-row">
                          <div className="spinner"></div>
                        </div>
                      )}
                      
                      {/* Sentinel */}
                      <div ref={sentinelRef} className="bottom-sentinel" />
                    </div>

                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Right Sidebar */}
          <div className="dashboard-right-sidebar-container">
            <RightSidebar />
          </div>

        </div>
      </div>
      
      <MobileBottomBar />
    </div>
  );
};

export default NotificationsPage;
