"use client";

import { useChatSession } from "@/context/ChatSessionContext";
import { useLanguage } from "@/context/LanguageContext";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { useMobile } from "@/context/MobileContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import { useEffect } from "react";

export default function SessionSidebar() {
  const {
    sessions,
    currentSession,
    createSession,
    loadSession,
    deleteSession,
  } = useChatSession();
  const { nativeLanguage, learningLanguage, updateLanguagesFromSession } =
    useLanguage();
  const { t } = useClientTranslations();
  const { isSidebarOpen, closeSidebar } = useMobile();
  const router = useRouter();

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      loadSession(sessionId);
      updateLanguagesFromSession(
        session.nativeLanguage,
        session.learningLanguage
      );
      closeSidebar(); // Close sidebar on mobile after selection
      router.push("/chat");
    }
  };

  const handleCreateSession = () => {
    createSession(nativeLanguage, learningLanguage);
    closeSidebar(); // Close sidebar on mobile after creation
    router.push("/chat");
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      const handleOutsideClick = () => closeSidebar();
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }
  }, [isSidebarOpen, closeSidebar]);

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}
      
      <aside 
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-64 sm:w-72 lg:w-64
          bg-white/95 lg:bg-white/90 backdrop-blur-sm 
          border-r border-gray-200 shadow-lg lg:shadow-lg
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-2">
          <button
            onClick={closeSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>
        
        <div className="p-3 lg:p-4 border-b border-gray-100 space-y-3">
        <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center">
          💬 {t('sidebar.sessions')}
        </h2>
        <button
          onClick={handleCreateSession}
          className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm"
        >
          <FaPlus className="mr-1.5" size={12} /> {t('sidebar.newSession')}
        </button>
      </div>
        <div className="flex-grow overflow-y-auto p-2 lg:p-3 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <p className="text-xs">{t('sidebar.noSessions')}</p>
            <p className="text-xs mt-1 opacity-75">{t('sidebar.createToStart')}</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentSession?.id === session.id
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => handleLoadSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 truncate">
                  {session.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('sidebar.messagesCount', { count: session.messages.length })} • {session.nativeLanguage.slice(0,2)}→{session.learningLanguage.slice(0,2)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      t('sidebar.deleteConfirm')
                    )
                  ) {
                    deleteSession(session.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1.5 rounded-md transition-all duration-200 hover:bg-red-50"
                title="Delete session"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))
        )}
        </div>
      </aside>
    </>
  );
}
