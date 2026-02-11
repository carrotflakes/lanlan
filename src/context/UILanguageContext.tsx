'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface UILanguageContextType {
  uiLanguage: string;
  setUILanguage: (lang: string) => void;
  availableUILanguages: { code: string; name: string; nativeName: string }[];
  isInitialized: boolean;
}

const availableUILanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

const UILanguageContext = createContext<UILanguageContextType | undefined>(undefined);

export function UILanguageProvider({ children }: { children: ReactNode }) {
  const [uiLanguage, setUILanguageState] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize UI language on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
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

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load UI language from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  // Save UI language to localStorage when it changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    try {
      localStorage.setItem('uiLanguage', uiLanguage);
    } catch (error) {
      console.error('Failed to save UI language to localStorage:', error);
    }
  }, [uiLanguage, isInitialized]);

  const setUILanguage = useCallback((lang: string) => {
    if (availableUILanguages.some(l => l.code === lang)) {
      setUILanguageState(lang);
    } else {
      console.warn(`Invalid UI language code: ${lang}`);
    }
  }, []);

  return (
    <UILanguageContext.Provider
      value={{
        uiLanguage,
        setUILanguage,
        availableUILanguages,
        isInitialized,
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