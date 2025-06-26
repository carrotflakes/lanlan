'use client';

import React from 'react';
import Link from 'next/link';
import { useClientTranslations } from '@/hooks/useClientTranslations';
import UILanguageSwitcher from './UILanguageSwitcher';

export default function Header() {
  const { t } = useClientTranslations();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <span>🌏 {t('app.title')}</span>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-600">
            {t('app.subtitle')}
          </div>
          <UILanguageSwitcher />
        </div>
      </div>
    </header>
  );
}