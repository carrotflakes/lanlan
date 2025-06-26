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
        className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
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