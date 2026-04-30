'use client';

import React from 'react';
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
  const { currentSession, updateSessionLanguages } = useChatSession();
  const { t } = useClientTranslations();

  const nativeLanguage = currentSession?.nativeLanguage || 'English';
  const learningLanguage = currentSession?.learningLanguage || 'Japanese';

  const handleNativeLanguageChange = (lang: string) => {
    if (currentSession) {
      updateSessionLanguages(currentSession.id, lang, learningLanguage);
    }
  };

  const handleLearningLanguageChange = (lang: string) => {
    if (currentSession) {
      updateSessionLanguages(currentSession.id, nativeLanguage, lang);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="native-language" className="block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {t('language.nativeLanguage')}
        </label>
        <div className="relative">
          <select
            id="native-language"
            className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
            value={nativeLanguage}
            onChange={(e) => handleNativeLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {t(`language.${lang.toLowerCase()}`)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-lg">{languageEmojis[nativeLanguage]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
          <span className="text-violet-600 dark:text-violet-400 font-bold text-xs">→</span>
        </div>
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
      </div>

      <div className="space-y-2">
        <label htmlFor="learning-language" className="block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {t('language.learningLanguage')}
        </label>
        <div className="relative">
          <select
            id="learning-language"
            className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
            value={learningLanguage}
            onChange={(e) => handleLearningLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {t(`language.${lang.toLowerCase()}`)}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-lg">{languageEmojis[learningLanguage]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
