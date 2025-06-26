'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UILanguageContextType {
  uiLanguage: string;
  setUILanguage: (lang: string) => void;
  availableUILanguages: { code: string; name: string; nativeName: string }[];
}

const availableUILanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

const UILanguageContext = createContext<UILanguageContextType | undefined>(undefined);

export function UILanguageProvider({ children }: { children: ReactNode }) {
  const [uiLanguage, setUILanguageState] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUILanguage = localStorage.getItem('uiLanguage');
      if (storedUILanguage && availableUILanguages.some(lang => lang.code === storedUILanguage)) {
        setUILanguageState(storedUILanguage);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (availableUILanguages.some(lang => lang.code === browserLang)) {
          setUILanguageState(browserLang);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uiLanguage', uiLanguage);
    }
  }, [uiLanguage]);

  const setUILanguage = (lang: string) => {
    setUILanguageState(lang);
  };

  return (
    <UILanguageContext.Provider
      value={{
        uiLanguage,
        setUILanguage,
        availableUILanguages,
      }}
    >
      {children}
    </UILanguageContext.Provider>
  );
}

export function useUILanguage() {
  const context = useContext(UILanguageContext);
  if (context === undefined) {
    throw new Error('useUILanguage must be used within a UILanguageProvider');
  }
  return context;
}