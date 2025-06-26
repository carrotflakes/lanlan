'use client';

import React from 'react';
import { useChatSession } from '@/context/ChatSessionContext';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function SessionSidebar() {
  const { sessions, currentSession, createSession, loadSession, deleteSession } = useChatSession();

  return (
    <aside className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-lg flex flex-col h-screen">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          💬 Chat Sessions
        </h2>
        <button
          onClick={createSession}
          className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <FaPlus className="mr-2" /> New Session
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No sessions yet</p>
            <p className="text-xs mt-1">Create one to get started!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                currentSession?.id === session.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => loadSession(session.id)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">{session.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {session.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
                    deleteSession(session.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-2 rounded-lg transition-all duration-200 hover:bg-red-50"
                title="Delete session"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
