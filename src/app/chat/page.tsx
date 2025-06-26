'use client';

import ChatInterface from './components/ChatInterface';
import { useClientTranslations } from '@/hooks/useClientTranslations';

export default function ChatPage() {
  const { t } = useClientTranslations();
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 sm:mb-3">
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center justify-center">
          🤖 {t('chat.title')}
        </h1>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
