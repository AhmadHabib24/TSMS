"use client";

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-[var(--color-gold)]/10 text-[var(--color-text)] transition-colors">
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="uppercase font-medium text-xs sm:text-base">{i18n.language}</span>
      </button>
      <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-32 bg-[var(--color-panel)] border border-[var(--color-border)] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 before:absolute before:-top-2 before:left-0 before:w-full before:h-2 before:content-['']">
        <button 
          onClick={() => changeLanguage('en')}
          className="block w-full text-left rtl:text-right px-4 py-2 hover:bg-[var(--color-background)] rounded-t-xl text-sm sm:text-base"
        >
          English
        </button>
        <button 
          onClick={() => changeLanguage('ur')}
          className="block w-full text-left rtl:text-right px-4 py-2 hover:bg-[var(--color-background)] text-sm sm:text-base"
        >
          اردو (Urdu)
        </button>
        <button 
          onClick={() => changeLanguage('ar')}
          className="block w-full text-left rtl:text-right px-4 py-2 hover:bg-[var(--color-background)] rounded-b-xl text-sm sm:text-base"
        >
          العربية (Arabic)
        </button>
      </div>
    </div>
  );
}
