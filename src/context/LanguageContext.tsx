import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';

export type Language = 'en' | 'ha' | 'yo' | 'ig';

export const languages = {
  en: { name: 'English', flag: '\ud83c\uddfa\ud83c\uddf8', label: 'English' },
  ha: { name: 'Hausa', flag: '\ud83c\uddf3\ud83c\uddec', label: 'Hausa' },
  yo: { name: 'Yoruba', flag: '\ud83c\uddf3\ud83c\uddec', label: 'Yoruba' },
  ig: { name: 'Igbo (Ebo)', flag: '\ud83c\uddf3\ud83c\uddec', label: 'Igbo' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    setLangState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && saved !== language) {
      i18n.changeLanguage(saved);
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  // Wrap t to ensure types match the context interface
  const translate = (key: string, defaultValue?: string): string => {
    return t(key, defaultValue);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};