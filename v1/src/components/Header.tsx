'use client';

import React from 'react';
import Link from 'next/link';
import { useClientTranslations } from '@/hooks/useClientTranslations';
import { useMobile } from '@/context/MobileContext';
import UILanguageSwitcher from './UILanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { FaBars } from 'react-icons/fa';

export default function Header() {
  const { t } = useClientTranslations();
  const { toggleSidebar } = useMobile();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <FaBars size={15} />
          </button>
          
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/30">
              <span className="text-white text-sm font-bold leading-none">L</span>
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 hidden sm:inline">
              {t('app.title')}
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UILanguageSwitcher />
        </div>
      </div>
    </header>
  );
}