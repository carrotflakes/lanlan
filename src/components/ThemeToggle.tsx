'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useClientTranslations } from '@/hooks/useClientTranslations';

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useClientTranslations();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
      title={isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {isDarkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
    </button>
  );
};