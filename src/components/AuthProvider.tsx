'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/providers/SettingsProvider';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        router.push('/');
        return;
      }

      if (!user) {
        try {
          const res = await api.post('/auth/me');
          login(token, res.data);
        } catch (error) {
          logout();
          router.push('/');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token, user, login, logout, router]);

  if (loading || settingsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        {settings?.light_logo_path && !settingsLoading ? (
          <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${settings.light_logo_path}`} alt="Logo" className="max-h-24 max-w-[80vw] object-contain animate-pulse" />
        ) : (
          <div className="text-[var(--color-gold)] font-bold text-2xl tracking-widest animate-pulse uppercase">
            {settingsLoading ? 'LOADING...' : (settings?.app_name || 'TSMS')}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
