'use client';

import ChatInterface from './components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
