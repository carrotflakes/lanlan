import ChatInterface from './components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          🤖 AI Language Practice
        </h1>
        <p className="text-center text-gray-600 mt-2">Start a conversation to practice your target language</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
