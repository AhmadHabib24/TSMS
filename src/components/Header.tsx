'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, User, CheckCircle, AlertTriangle, Sun, Moon } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';
import { useNotifications } from '@/hooks/useNotifications';
import LanguageSwitcher from './LanguageSwitcher';
import { useLayoutStore } from '@/store/useLayoutStore';
import { Menu } from 'lucide-react';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { toggleMobileSidebar } = useLayoutStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Theme init
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-[var(--color-gold)]" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-blue-400" />;
    }
  };

  return (
    <header className="h-16 bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 z-10 print:hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-0 sm:p-2 rounded-lg hover:bg-[var(--color-panel)] transition-colors text-[var(--color-gold)] shrink-0"
        >
          <Menu size={24} />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-semibold capitalize hidden sm:block truncate">Welcome back, {user?.name || 'User'}</h2>
          <h2 className="text-base font-semibold capitalize sm:hidden truncate">Hi, {user?.name || 'User'}</h2>
          <p className="text-xs md:text-sm text-gray-400 truncate">Role: <span className="text-[var(--color-gold)]">{user?.role?.name || 'Unknown'}</span></p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 relative shrink-0 pl-2">
        <LanguageSwitcher />
        
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--color-panel)] transition-colors relative cursor-pointer text-gray-400 hover:text-[var(--color-gold)]">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div ref={notificationRef} className="relative flex items-center">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full hover:bg-[var(--color-panel)] transition-colors relative cursor-pointer text-gray-400 hover:text-[var(--color-gold)]">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-12 right-0 w-[280px] sm:w-80 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]">
                <h3 className="font-bold text-[var(--color-foreground)]">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs bg-[var(--color-gold)] text-black px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">No new notifications.</div>
                ) : (
                  notifications.map((n: any, idx: number) => (
                    <div key={n.id || idx} className={`p-4 border-b border-[var(--color-border)] transition-colors cursor-pointer flex gap-3 items-start ${n.read_at ? 'bg-transparent hover:bg-[var(--color-background)]' : 'bg-[var(--color-background)]'}`}>
                      <div className="mt-1">{getIcon(n.data?.type || n.type)}</div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{n.data?.title || n.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{n.data?.message || n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {unreadCount > 0 && (
                <div onClick={markAllAsRead} className="p-3 text-center bg-[var(--color-background)] cursor-pointer hover:text-[var(--color-gold)] transition-colors border-t border-[var(--color-border)] text-sm font-bold text-gray-400">
                  Mark all as read
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-[var(--color-panel)] transition-colors cursor-pointer border border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-black font-bold uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}