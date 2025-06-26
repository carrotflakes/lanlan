import ChatInterface from './components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <h1 className="text-lg font-semibold text-gray-800 flex items-center justify-center">
          🤖 AI Language Practice
        </h1>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
