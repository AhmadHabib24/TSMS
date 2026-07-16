'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-black"><div className="text-[var(--color-gold)] font-bold text-2xl tracking-widest animate-pulse">PLAYBOY SALON</div></div>;
  }

  return <>{children}</>;
}
