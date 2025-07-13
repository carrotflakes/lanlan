"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

export interface Annotation {
  word: string;
  explanation: string;
}

export interface Message {
  role: "user" | "model";
  parts: string;
  translatedText?: string;
  showTranslation?: boolean;
  annotations?: Annotation[];
  showAnnotations?: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  nativeLanguage: string;
  learningLanguage: string;
}

// Default language constants
const DEFAULT_NATIVE_LANGUAGE = "English";
const DEFAULT_LEARNING_LANGUAGE = "Japanese";

interface ChatSessionContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createSession: (nativeLanguage?: string, learningLanguage?: string) => void;
  loadSession: (sessionId: string) => void;
  updateCurrentSessionMessages: (newMessages: Message[]) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionLanguages: (
    sessionId: string,
    nativeLanguage: string,
    learningLanguage: string
  ) => void;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(
  undefined
);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );

  // Helper function to create a default session
  const createDefaultSession = (sessionNumber?: number): ChatSession => {
    const sessionName = sessionNumber
      ? `Session ${sessionNumber}`
      : "Session 1";
    return {
      id: uuidv4(),
      name: sessionName,
      messages: [],
      createdAt: Date.now(),
      nativeLanguage: DEFAULT_NATIVE_LANGUAGE,
      learningLanguage: DEFAULT_LEARNING_LANGUAGE,
    };
  };

  // Helper function to initialize default session and set it as current
  const initializeDefaultSession = () => {
    const defaultSession = createDefaultSession();
    setSessions([defaultSession]);
    setCurrentSession(defaultSession);
  };

  // Load sessions from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSessions = localStorage.getItem("chatSessions");
      if (storedSessions) {
        try {
          const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
          // Ensure all sessions have required language properties
          const validatedSessions = parsedSessions.map((session) => ({
            ...session,
            nativeLanguage: session.nativeLanguage || DEFAULT_NATIVE_LANGUAGE,
            learningLanguage:
              session.learningLanguage || DEFAULT_LEARNING_LANGUAGE,
          }));
          setSessions(validatedSessions);

          // Try to load the last active session or create a new one
          const lastSessionId = localStorage.getItem("lastActiveSessionId");
          if (lastSessionId) {
            const lastSession = validatedSessions.find(
              (s) => s.id === lastSessionId
            );
            if (lastSession) {
              setCurrentSession(lastSession);
            } else {
              initializeDefaultSession();
            }
          } else {
            initializeDefaultSession();
          }
        } catch (error) {
          console.error("Failed to parse stored sessions:", error);
          initializeDefaultSession();
        }
      } else {
        initializeDefaultSession();
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save current session ID to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentSession) {
      localStorage.setItem("lastActiveSessionId", currentSession.id);
    }
  }, [currentSession]);

  const createSession = (
    nativeLanguage: string = DEFAULT_NATIVE_LANGUAGE,
    learningLanguage: string = DEFAULT_LEARNING_LANGUAGE
  ) => {
    const sessionNumber = sessions.length + 1;
    const newSession: ChatSession = {
      id: uuidv4(),
      name: `Session ${sessionNumber}`,
      messages: [],
      createdAt: Date.now(),
      nativeLanguage,
      learningLanguage,
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
      setCurrentSession((prev) =>
        prev ? { ...prev, messages: newMessages } : null
      );
    }
  };

  const updateSessionLanguages = (
    sessionId: string,
    nativeLanguage: string,
    learningLanguage: string
  ) => {
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === sessionId ? { ...s, nativeLanguage, learningLanguage } : s
      )
    );
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession((prev) =>
        prev ? { ...prev, nativeLanguage, learningLanguage } : null
      );
    }
  };

  const deleteSession = (sessionId: string) => {
    const sessionToDelete = sessions.find((s) => s.id === sessionId);
    if (!sessionToDelete) return;

    const filteredSessions = sessions.filter((s) => s.id !== sessionId);

    // If the deleted session was the current one
    if (currentSession && currentSession.id === sessionId) {
      if (filteredSessions.length > 0) {
        // Load the most recent remaining session
        const mostRecentSession = filteredSessions.sort(
          (a, b) => b.createdAt - a.createdAt
        )[0];
        setSessions(filteredSessions);
        setCurrentSession(mostRecentSession);
      } else {
        // No sessions left, create a new one
        initializeDefaultSession();
      }
    } else {
      // Deleted session was not the current one, just remove it
      setSessions(filteredSessions);
    }
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
        updateSessionLanguages,
      }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession() {
  const context = useContext(ChatSessionContext);
  if (context === undefined) {
    throw new Error("useChatSession must be used within a ChatSessionProvider");
  }
  return context;
}
