'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';

interface Settings {
  app_name: string;
  theme_color: string;
  font_family: string;
  dark_logo_path: string | null;
  light_logo_path: string | null;
  favicon_path: string | null;
}

interface SettingsContextType {
  settings: Settings;
  refreshSettings: () => void;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  app_name: 'PLAYBOY SALON',
  theme_color: '#D4AF37',
  font_family: 'Outfit',
  dark_logo_path: null,
  light_logo_path: null,
  favicon_path: null
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  refreshSettings: () => {},
  isLoading: true
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await api.get('/general-settings');
      setSettings(res.data);
    } catch (e) {
      console.error("Failed to load general settings", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  // Update DOM dynamically
  useEffect(() => {
    if (!isLoading) {
      // 1. Update Title
      document.title = settings.app_name;

      // 2. Update Favicon
      if (settings.favicon_path) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = `${process.env.NEXT_PUBLIC_STORAGE_URL}/${settings.favicon_path}`;
      }

      // 3. Inject CSS Variables
      const root = document.documentElement;
      if (settings.theme_color) {
        root.style.setProperty('--gold-primary', settings.theme_color);
        root.style.setProperty('--gold-hover', settings.theme_color); // For simplicity
      }

      // 4. Inject Google Font dynamically if not Outfit
      const fontFamily = settings.font_family || 'Outfit';
      if (fontFamily !== 'Outfit') {
        const fontId = `font-${fontFamily.replace(/\s+/g, '-')}`;
        if (!document.getElementById(fontId)) {
          const link = document.createElement('link');
          link.id = fontId;
          link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700;800&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
        document.body.style.fontFamily = `"${fontFamily}", sans-serif`;
      } else {
        document.body.style.fontFamily = ''; // Default to CSS which handles Outfit
      }
    }
  }, [settings, isLoading]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}
