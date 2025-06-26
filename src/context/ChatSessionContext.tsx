'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  role: 'user' | 'model';
  parts: string;
  translatedText?: string;
  showTranslation?: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

interface ChatSessionContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createSession: () => void;
  loadSession: (sessionId: string) => void;
  updateCurrentSessionMessages: (newMessages: Message[]) => void;
  deleteSession: (sessionId: string) => void;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Load sessions from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSessions = localStorage.getItem('chatSessions');
      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
        setSessions(parsedSessions);
        // Try to load the last active session or create a new one
        const lastSessionId = localStorage.getItem('lastActiveSessionId');
        if (lastSessionId) {
          const lastSession = parsedSessions.find(s => s.id === lastSessionId);
          if (lastSession) {
            setCurrentSession(lastSession);
          } else {
            createSession(); // If last session not found, create new
          }
        } else {
          createSession(); // No last session, create new
        }
      } else {
        createSession(); // No sessions stored, create the first one
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSession) {
      localStorage.setItem('lastActiveSessionId', currentSession.id);
    }
  }, [currentSession]);

  const createSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: `Session ${sessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);
  };

  const loadSession = (sessionId: string) => {
    const sessionToLoad = sessions.find((s) => s.id === sessionId);
    if (sessionToLoad) {
      setCurrentSession(sessionToLoad);
    }
  };

  const updateCurrentSessionMessages = (newMessages: Message[]) => {
    if (currentSession) {
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === currentSession.id ? { ...s, messages: newMessages } : s
        )
      );
      setCurrentSession((prev) => (prev ? { ...prev, messages: newMessages } : null));
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const filteredSessions = prev.filter((s) => s.id !== sessionId);
      
      // If the deleted session was the current one
      if (currentSession && currentSession.id === sessionId) {
        if (filteredSessions.length > 0) {
          // Load the most recent remaining session
          const mostRecentSession = filteredSessions.sort((a, b) => b.createdAt - a.createdAt)[0];
          setCurrentSession(mostRecentSession);
        } else {
          // No sessions left, create a new one
          const newSession: ChatSession = {
            id: uuidv4(),
            name: `Session 1`,
            messages: [],
            createdAt: Date.now(),
          };
          setCurrentSession(newSession);
          return [newSession];
        }
      }
      
      return filteredSessions;
    });
  };

  return (
    <ChatSessionContext.Provider
      value={{
        sessions,
        currentSession,
        createSession,
        loadSession,
        updateCurrentSessionMessages,
        deleteSession,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (context === undefined) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
}
