'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Receipt, Users, Scissors } from 'lucide-react';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { openMobileSidebar } = useLayoutStore();
  const { t } = useTranslation();
  const { can, hasFeature, isPlanExpired } = usePermissions();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', alwaysShow: true },
    { href: '/billing', icon: Receipt, label: 'Billing', check: 'billing' },
    { href: '/customers', icon: Users, label: 'Customers', check: 'customers' },
    { href: '/services', icon: Scissors, label: 'Services', check: 'services' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-panel)] border-t border-[var(--color-border)] flex justify-around items-center z-40 px-2 pb-safe no-print shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <button 
        onClick={openMobileSidebar} 
        className="flex flex-col items-center gap-1 text-gray-400 hover:text-[var(--color-gold)] transition-colors p-2"
      >
        <Menu size={20} />
        <span className="text-[10px] font-medium">{t('Menu')}</span>
      </button>

      {navItems.map((item) => {
        // Skip if they don't have permission/feature
        if (!item.alwaysShow && item.check) {
          if (!can(item.check as any, 'view') || !hasFeature(item.check as any) || isPlanExpired()) {
            return null;
          }
        }

        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex flex-col items-center gap-1 transition-colors p-2 ${isActive ? 'text-[var(--color-gold)]' : 'text-gray-400 hover:text-[var(--color-gold)]'}`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{t(item.label)}</span>
          </Link>
        );
      })}
    </div>
  );
}
