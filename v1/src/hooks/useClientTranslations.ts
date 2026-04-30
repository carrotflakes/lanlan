'use client';

import { useState, useEffect } from 'react';
import { useUILanguage } from '@/context/UILanguageContext';

type Messages = Record<string, unknown>;

export function useClientTranslations() {
  const { uiLanguage } = useUILanguage();
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    import(`@/i18n/messages/${uiLanguage}.json`)
      .then((module) => {
        setMessages(module.default);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load translations:', error);
        // Fallback to English
        import('@/i18n/messages/en.json')
          .then((module) => {
            setMessages(module.default);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      });
  }, [uiLanguage]);

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: unknown = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Simple parameter substitution
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return { t, isLoading };
}