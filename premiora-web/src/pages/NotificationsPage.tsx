import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { NotificationService } from '../services/NotificationService';
import { NotificationItem } from '../components/notifications/NotificationItem';
import type { SocialNotification } from '../types/socialNotification';
import { Bell, CheckCheck } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Header, Sidebar, MobileBottomBar } from '../components/layout';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { ref, inView } = useInView();

  const fetchNotifications = async (reset = false) => {
    try {
      const currentPage = reset ? 0 : page;
      const data = await NotificationService.getNotifications(20, currentPage * 20);
      
      if (data.length < 20) {
        setHasMore(false);
      }

      if (reset) {
        setNotifications(data);
        setPage(1);
      } else {
        setNotifications(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    // Realtime subscription
    const subscription = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = await NotificationService.getNotificationById(payload.new.id);
            if (newNotification) {
              setNotifications(prev => [newNotification, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchNotifications();
    }
  }, [inView, hasMore]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 max-w-2xl w-full mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notificações
            </h1>
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden min-h-[400px]">
            {notifications.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
                
                {hasMore && (
                  <div ref={ref} className="p-4 text-center text-gray-500">
                    Carregando mais...
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      <MobileBottomBar />
    </div>
  );
};

export default NotificationsPage;
