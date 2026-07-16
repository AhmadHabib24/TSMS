import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/store/useAuthStore';

// Setup global Pusher for Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuthStore();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  useEffect(() => {
    if (!token || !user?.id) return;
    
    fetchNotifications();

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;

    if (!pusherKey) {
        console.warn("Pusher key is not configured.");
        return;
    }

    const echo = new Echo({
      broadcaster: 'pusher',
      key: pusherKey,
      cluster: pusherCluster,
      forceTLS: true,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    echo.private(`App.Models.User.${user.id}`)
      .notification((notification: any) => {
        console.log("New notification received:", notification);
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
      });

    return () => {
      echo.disconnect();
    };
  }, [user?.id, token]);

  return { notifications, unreadCount, markAllAsRead };
}
