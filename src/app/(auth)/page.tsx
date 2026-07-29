'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettings } from '@/providers/SettingsProvider';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@playboy.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const { settings } = useSettings();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back to ${settings.app_name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Gold Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-[var(--color-gold)] uppercase mb-2">{settings.app_name}</h1>
          <p className="text-gray-400">Sign in to your VIP Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              placeholder="admin@playboy.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-gold)] text-black font-bold py-3 px-4 rounded-xl hover:bg-[var(--color-gold-hover)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">Forgot your password?</a>
        </div>
      </div>
    </div>
  );
}
