'use client';

import LanguageSelector from "@/components/LanguageSelector";
import { useChatSession } from "@/context/ChatSessionContext";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { useRouter } from "next/navigation";

export default function Home() {
  const { createSession, currentSession } = useChatSession();
  const { t } = useClientTranslations();
  const router = useRouter();

  const handleStartLearning = () => {
    const nativeLanguage = currentSession?.nativeLanguage || 'English';
    const learningLanguage = currentSession?.learningLanguage || 'Japanese';
    createSession(nativeLanguage, learningLanguage);
    router.push('/chat');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white text-3xl font-bold leading-none">L</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
            {t('home.welcome', { appName: t('app.title') })}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base px-2">
            {t('home.description')}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-5">
          <LanguageSelector />
        </div>
        
        <button 
          onClick={handleStartLearning}
          className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 text-sm sm:text-base"
        >
          {t('home.startLearning')}
        </button>
        
        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-600">
          {t('home.poweredBy')}
        </p>
      </div>
    </div>
  );
}