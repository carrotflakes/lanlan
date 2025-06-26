'use client';

import LanguageSelector from "@/components/LanguageSelector";
import { useChatSession } from "@/context/ChatSessionContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { createSession } = useChatSession();
  const { nativeLanguage, learningLanguage } = useLanguage();
  const router = useRouter();

  const handleStartLearning = () => {
    createSession(nativeLanguage, learningLanguage);
    router.push('/chat');
  };
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">LanLan</span>! 🎆
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Learn new languages interactively with AI-powered conversations.
            Practice speaking, get instant translations, and improve your skills naturally.
          </p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
          <LanguageSelector />
        </div>
        
        <button 
          onClick={handleStartLearning}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <span className="mr-2">🚀</span>
          Start Learning Now
        </button>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
}