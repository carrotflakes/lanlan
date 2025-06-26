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
      className="p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
      title={isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
    </button>
  );
};