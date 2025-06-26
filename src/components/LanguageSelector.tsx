'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="native-language" className="block text-sm font-semibold text-gray-700">
          🏠 Your Native Language
        </label>
        <div className="relative">
          <select
            id="native-language"
            className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl bg-white shadow-sm transition-all duration-200"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {lang}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
        <label htmlFor="learning-language" className="block text-sm font-semibold text-gray-700">
          🎯 Language to Learn
        </label>
        <div className="relative">
          <select
            id="learning-language"
            className="w-full pl-4 pr-12 py-3 text-base border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl bg-white shadow-sm transition-all duration-200"
            value={learningLanguage}
            onChange={(e) => setLearningLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {languageEmojis[lang]} {lang}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-2xl">{languageEmojis[learningLanguage]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
