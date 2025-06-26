'use client';

import LanguageSelector from "@/components/LanguageSelector";
import { useChatSession } from "@/context/ChatSessionContext";
import { useLanguage } from "@/context/LanguageContext";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { useRouter } from "next/navigation";

export default function Home() {
  const { createSession } = useChatSession();
  const { nativeLanguage, learningLanguage } = useLanguage();
  const { t } = useClientTranslations();
  const router = useRouter();

  const handleStartLearning = () => {
    createSession(nativeLanguage, learningLanguage);
    router.push('/chat');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto text-center w-full">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            {t('home.welcome', { appName: t('app.title') })} 🎆
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            {t('home.description')}
          </p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200 mb-6 sm:mb-8">
          <LanguageSelector />
        </div>
        
        <button 
          onClick={handleStartLearning}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <span className="mr-2">🚀</span>
          {t('home.startLearning')}
        </button>
        
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
          <p>{t('home.poweredBy')}</p>
        </div>
      </div>
    </div>
  );
}