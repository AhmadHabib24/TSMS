'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettings } from '@/providers/SettingsProvider';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import BookingWidget from '@/components/BookingWidget';
import FloatingChatbot from '@/components/FloatingChatbot';
import SupportWidget from '@/components/SupportWidget';

export default function RootPage() {
  const [landingPage, setLandingPage] = useState<any>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const { settings } = useSettings();

  useEffect(() => {
    fetchLandingPage();
  }, []);

  const fetchLandingPage = async () => {
    try {
      const res = await api.get('/public/landing-page');
      setLandingPage(res.data);
    } catch (error) {
      // 403 or 404 means no landing page or not active, just fallback to login
      setLandingPage(null);
    } finally {
      setLoadingPage(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back to ${settings.app_name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoadingLogin(false);
    }
  };

  if (loadingPage) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-8 h-8 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // --- Dynamic Landing Page Render ---
  if (landingPage) {
    let blocks = [];
    try { blocks = typeof landingPage.blocks === 'string' ? JSON.parse(landingPage.blocks) : (landingPage.blocks || []); } catch(e){}
    const themeColor = landingPage.settings?.themeColor || '#eab308';

    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white" style={{ '--theme-color': themeColor } as React.CSSProperties}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="font-black text-2xl tracking-tighter">{landingPage.title || settings.app_name}</div>
            <button onClick={() => setLandingPage(null)} className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: themeColor }}>
              <LogIn size={18} /> Client Login
            </button>
          </div>
        </nav>

        {/* Blocks Renderer */}
        <div className="pt-20 pb-20">
          {blocks.length === 0 ? (
            <div className="text-center py-32 text-gray-400">Website is currently under construction.</div>
          ) : (
            blocks.map((block: any) => {
              if (block.type === 'hero') {
                return (
                  <section key={block.id} className="py-20 md:py-32 px-4 md:px-6 text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight leading-tight">{block.content.heading}</h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-500 mb-8 md:mb-10 max-w-2xl mx-auto">{block.content.subheading}</p>
                    {block.content.buttonText && (
                      <button className="w-full md:w-auto px-8 py-4 rounded-full font-bold text-white text-lg transition-transform hover:scale-105 shadow-xl" style={{ backgroundColor: themeColor }}>
                        {block.content.buttonText}
                      </button>
                    )}
                  </section>
                );
              }
              if (block.type === 'text') {
                return <section key={block.id} className="py-12 md:py-16 px-4 md:px-6 max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">{block.content.text}</section>;
              }
              if (block.type === 'image') {
                return block.content.url ? <section key={block.id} className="py-8 md:py-12 px-4 md:px-6 max-w-5xl mx-auto"><img src={block.content.url} className="w-full rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl" alt="" /></section> : null;
              }
              if (block.type === 'video') {
                return block.content.url ? (
                  <section key={block.id} className="py-8 md:py-12 px-4 md:px-6 max-w-4xl mx-auto">
                    <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl bg-gray-100">
                      <iframe src={block.content.url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen></iframe>
                    </div>
                  </section>
                ) : null;
              }
              if (block.type === 'booking') {
                return (
                  <section key={block.id} className="py-16 md:py-24 px-4 md:px-6 bg-gray-50 mt-8 md:mt-12 border-y border-gray-100">
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">{block.content?.title || 'Book an Appointment'}</h2>
                      <BookingWidget themeColor={themeColor} />
                    </div>
                  </section>
                );
              }
              if (block.type === 'support') {
                return (
                  <section key={block.id} className="py-16 md:py-24 px-4 md:px-6 bg-white mt-8 md:mt-12">
                    <div className="max-w-4xl mx-auto text-center">
                      <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">{block.content?.title || 'Contact Support'}</h2>
                      <SupportWidget themeColor={themeColor} />
                    </div>
                  </section>
                );
              }
              return null;
            })
          )}
        </div>

        <FloatingChatbot />
      </div>
    );
  }

  // --- Fallback Login Component ---

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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl py-3 pl-4 pr-12 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[var(--color-gold)] transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loadingLogin}
            className="w-full bg-[var(--color-gold)] text-black font-bold py-3 px-4 rounded-xl hover:bg-[var(--color-gold-hover)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loadingLogin ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-gray-500 hover:text-[var(--color-gold)] transition-colors">Forgot your password?</a>
        </div>
      </div>
    </div>
  );
}
