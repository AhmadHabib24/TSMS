"use client";

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export default function ClientI18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Set RTL direction based on initial language
    const currentLang = i18n.language;
    if (currentLang === 'ur' || currentLang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Listen for language changes to update RTL
    i18n.on('languageChanged', (lng) => {
      if (lng === 'ur' || lng === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      localStorage.setItem('language', lng);
    });
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
