'use client';

import React from 'react';
import { useUILanguage } from '@/context/UILanguageContext';
import { useClientTranslations } from '@/hooks/useClientTranslations';

export default function UILanguageSwitcher() {
  const { uiLanguage, setUILanguage, availableUILanguages } = useUILanguage();
  const { t } = useClientTranslations();

  return (
    <div className="relative">
      <select
        value={uiLanguage}
        onChange={(e) => setUILanguage(e.target.value)}
        className="text-xs bg-transparent border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
        title={t('ui.language')}
      >
        {availableUILanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}