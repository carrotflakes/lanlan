'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useChatSession } from '@/context/ChatSessionContext';
import { useClientTranslations } from '@/hooks/useClientTranslations';

const languages = [
  'English',
  'Japanese',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Korean',
];

const languageEmojis: { [key: string]: string } = {
  'English': '🇺🇸',
  'Japanese': '🇯🇵',
  'Spanish': '🇪🇸',
  'French': '🇫🇷',
  'German': '🇩🇪',
  'Chinese': '🇨🇳',
  'Korean': '🇰🇷',
};

export default function LanguageSelector() {
  const { nativeLanguage, setNativeLanguage, learningLanguage, setLearningLanguage } = useLanguage();
  const { currentSession, updateSessionLanguages } = useChatSession();
  const { t } = useClientTranslations();

  const handleNativeLanguageChange = (lang: string) => {
    setNativeLanguage(lang);
    if (currentSession) {
      updateSessionLanguages(currentSession.id, lang, learningLanguage);
    }
  };

  const handleLearningLanguageChange = (lang: string) => {
    setLearningLanguage(lang);
    if (currentSession) {
      updateSessionLanguages(currentSession.id, nativeLanguage, lang);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="native-language" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          🏠 {t('language.nativeLanguage')}
        </label>
        <div className="relative">
          <select
            id="native-language"
            className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200"
            value={nativeLanguage}
            onChange={(e) => handleNativeLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {t(`language.${lang.toLowerCase()}`)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pr-3 pointer-events-none">
            <span className="text-2xl">{languageEmojis[nativeLanguage]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">→</span>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="learning-language" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          🎯 {t('language.learningLanguage')}
        </label>
        <div className="relative">
          <select
            id="learning-language"
            className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200"
            value={learningLanguage}
            onChange={(e) => handleLearningLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {t(`language.${lang.toLowerCase()}`)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pr-3 pointer-events-none">
            <span className="text-2xl">{languageEmojis[learningLanguage]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
