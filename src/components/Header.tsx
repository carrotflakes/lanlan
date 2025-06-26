'use client';

import React from 'react';
import Link from 'next/link';
import { useClientTranslations } from '@/hooks/useClientTranslations';
import { useMobile } from '@/context/MobileContext';
import UILanguageSwitcher from './UILanguageSwitcher';
import { FaBars } from 'react-icons/fa';

export default function Header() {
  const { t } = useClientTranslations();
  const { toggleSidebar } = useMobile();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-3 sm:px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaBars size={16} />
          </button>
          
          <Link 
            href="/" 
            className="text-base sm:text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1 sm:space-x-2"
          >
            <span className="text-lg sm:text-xl">🌏</span>
            <span className="hidden sm:inline">{t('app.title')}</span>
            <span className="sm:hidden text-sm">{t('app.title')}</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:block text-xs text-gray-600">
            {t('app.subtitle')}
          </div>
          <UILanguageSwitcher />
        </div>
      </div>
    </header>
  );
}