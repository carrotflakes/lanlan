"use client";

import { useChatSession } from "@/context/ChatSessionContext";
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
  const { t } = useClientTranslations();
  const { isSidebarOpen, closeSidebar } = useMobile();
  const router = useRouter();

  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    closeSidebar(); // Close sidebar on mobile after selection
    router.push("/chat");
  };

  const handleCreateSession = () => {
    const nativeLanguage = currentSession?.nativeLanguage || 'English';
    const learningLanguage = currentSession?.learningLanguage || 'Japanese';
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeSidebar} />
      )}
      
      <aside 
        className={`
          fixed lg:relative z-50 lg:z-auto
          w-64 sm:w-72 lg:w-64
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          shadow-xl lg:shadow-none
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-3">
          <button
            onClick={closeSidebar}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <FaTimes size={14} />
          </button>
        </div>
        
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500">
            {t('sidebar.sessions')}
          </h2>
          <button
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30"
          >
            <FaPlus size={11} /> {t('sidebar.newSession')}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-10">
              <p className="text-xs">{t('sidebar.noSessions')}</p>
              <p className="text-xs mt-1 opacity-60">{t('sidebar.createToStart')}</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer ${
                  currentSession?.id === session.id
                    ? "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
                onClick={() => handleLoadSession(session.id)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {session.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {t('sidebar.messagesCount', { count: session.messages.length })} · {session.nativeLanguage.slice(0,2)}→{session.learningLanguage.slice(0,2)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(t('sidebar.deleteConfirm'))) {
                      deleteSession(session.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Delete session"
                >
                  <FaTrash size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
