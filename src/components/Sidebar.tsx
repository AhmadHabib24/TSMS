'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Scissors, Briefcase, FileText, Settings, LogOut, Package, Receipt, UserCog, Layers, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useSettings } from '@/providers/SettingsProvider';

import { useLayoutStore } from '@/store/useLayoutStore';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);
  const { can } = usePermissions();
  const { settings } = useSettings();
  const { isMobileSidebarOpen, closeMobileSidebar } = useLayoutStore();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside className={`w-full md:w-72 h-screen bg-[var(--color-panel)] border-r border-[var(--color-border)] flex flex-col fixed print:hidden z-50 transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l rtl:md:translate-x-0 rtl:${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-center border-b border-[var(--color-border)] p-2 relative px-12">
          {settings.light_logo_path ? (
            <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${settings.light_logo_path}`} alt="Logo" className="max-h-full max-w-full object-contain" />
          ) : (
            <h1 className="text-lg md:text-xl font-bold tracking-widest text-[var(--color-gold)] uppercase text-center leading-tight truncate">{settings.app_name}</h1>
          )}
          <button
            className="absolute right-3 sm:right-4 text-gray-400 hover:text-white md:hidden p-1 bg-[var(--color-panel)]/80 rounded"
            onClick={closeMobileSidebar}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" active={pathname === '/dashboard'} onClick={closeMobileSidebar} />
          {can('billing', 'view') && <NavItem href="/billing" icon={<Receipt size={20} />} label="Billing" active={pathname === '/billing'} onClick={closeMobileSidebar} />}
          {can('customers', 'view') && <NavItem href="/customers" icon={<Users size={20} />} label="Customers" active={pathname === '/customers'} onClick={closeMobileSidebar} />}
          {can('services', 'view') && <NavItem href="/services" icon={<Scissors size={20} />} label="Services" active={pathname === '/services'} onClick={closeMobileSidebar} />}
          {can('employees', 'view') && <NavItem href="/employees" icon={<Briefcase size={20} />} label="Employees" active={pathname === '/employees'} onClick={closeMobileSidebar} />}
          {can('inventory', 'view') && <NavItem href="/inventory" icon={<Package size={20} />} label="Inventory" active={pathname === '/inventory'} onClick={closeMobileSidebar} />}
          {can('users', 'view') && <NavItem href="/users" icon={<UserCog size={20} />} label="Users" active={pathname === '/users'} onClick={closeMobileSidebar} />}
          {can('roles', 'view') && <NavItem href="/roles" icon={<Settings size={20} />} label="Roles" active={pathname === '/roles'} onClick={closeMobileSidebar} />}
          {can('reports', 'view') && <NavItem href="/reports" icon={<FileText size={20} />} label="Reports" active={pathname === '/reports'} onClick={closeMobileSidebar} />}
          {can('reports', 'view') && <NavItem href="/finance" icon={<DollarSign size={20} />} label="Finance" active={pathname === '/finance'} onClick={closeMobileSidebar} />}

          {can('service_categories', 'view') && <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" active={pathname === '/settings'} onClick={closeMobileSidebar} />}
        </nav>
        <div className="p-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            <span>{t('Logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ href, icon, label, active = false, onClick }: { href: string, icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  const { t } = useTranslation();
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors ${active ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'text-gray-400 hover:text-white hover:bg-[var(--color-border)]'}`}
    >
      {icon}
      <span className="font-medium">{t(label)}</span>
    </Link>
  );
}
