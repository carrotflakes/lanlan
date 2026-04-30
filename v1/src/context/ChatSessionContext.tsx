"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
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

export interface ChatSession {
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

// State type
interface ChatSessionState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isInitialized: boolean;
}

// Action types
type ChatSessionAction =
  | { type: "INITIALIZE"; payload: { sessions: ChatSession[]; currentSessionId?: string } }
  | { type: "CREATE_SESSION"; payload: ChatSession }
  | { type: "LOAD_SESSION"; payload: string }
  | { type: "UPDATE_MESSAGES"; payload: { sessionId: string; messages: Message[] } }
  | { type: "UPDATE_LANGUAGES"; payload: { sessionId: string; nativeLanguage: string; learningLanguage: string } }
  | { type: "DELETE_SESSION"; payload: string };

// Context type
interface ChatSessionContextType extends ChatSessionState {
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

// Helper function to create a default session
const createDefaultSession = (sessionNumber: number): ChatSession => ({
  id: uuidv4(),
  name: `Session ${sessionNumber}`,
  messages: [],
  createdAt: Date.now(),
  nativeLanguage: DEFAULT_NATIVE_LANGUAGE,
  learningLanguage: DEFAULT_LEARNING_LANGUAGE,
});

// Reducer function
function chatSessionReducer(
  state: ChatSessionState,
  action: ChatSessionAction
): ChatSessionState {
  switch (action.type) {
    case "INITIALIZE": {
      const { sessions, currentSessionId } = action.payload;
      if (sessions.length === 0) {
        const defaultSession = createDefaultSession(1);
        return {
          sessions: [defaultSession],
          currentSession: defaultSession,
          isInitialized: true,
        };
      }

      let currentSession: ChatSession;
      if (currentSessionId) {
        const found = sessions.find((s) => s.id === currentSessionId);
        currentSession = found || sessions.reduce((latest, s) =>
          s.createdAt > latest.createdAt ? s : latest
        );
      } else {
        currentSession = sessions.reduce((latest, s) =>
          s.createdAt > latest.createdAt ? s : latest
        );
      }

      return {
        sessions,
        currentSession,
        isInitialized: true,
      };
    }

    case "CREATE_SESSION": {
      const newSession = action.payload;
      return {
        ...state,
        sessions: [...state.sessions, newSession],
        currentSession: newSession,
      };
    }

    case "LOAD_SESSION": {
      const sessionId = action.payload;
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;

      return {
        ...state,
        currentSession: session,
      };
    }

    case "UPDATE_MESSAGES": {
      const { sessionId, messages } = action.payload;
      const updatedSessions = state.sessions.map((s) =>
        s.id === sessionId ? { ...s, messages } : s
      );

      return {
        ...state,
        sessions: updatedSessions,
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, messages }
            : state.currentSession,
      };
    }

    case "UPDATE_LANGUAGES": {
      const { sessionId, nativeLanguage, learningLanguage } = action.payload;
      const updatedSessions = state.sessions.map((s) =>
        s.id === sessionId ? { ...s, nativeLanguage, learningLanguage } : s
      );

      return {
        ...state,
        sessions: updatedSessions,
        currentSession:
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, nativeLanguage, learningLanguage }
            : state.currentSession,
      };
    }

    case "DELETE_SESSION": {
      const sessionId = action.payload;
      const filteredSessions = state.sessions.filter((s) => s.id !== sessionId);

      // If no sessions remain, create a new default session
      if (filteredSessions.length === 0) {
        const defaultSession = createDefaultSession(1);
        return {
          ...state,
          sessions: [defaultSession],
          currentSession: defaultSession,
        };
      }

      // If the deleted session was the current one, switch to most recent
      if (state.currentSession?.id === sessionId) {
        const mostRecentSession = filteredSessions.reduce((latest, s) =>
          s.createdAt > latest.createdAt ? s : latest
        );
        return {
          ...state,
          sessions: filteredSessions,
          currentSession: mostRecentSession,
        };
      }

      return {
        ...state,
        sessions: filteredSessions,
      };
    }

    default:
      return state;
  }
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(
  undefined
);

export function ChatSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatSessionReducer, {
    sessions: [],
    currentSession: null,
    isInitialized: false,
  });

  // Load sessions from localStorage on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedSessions = localStorage.getItem("chatSessions");
      const lastSessionId = localStorage.getItem("lastActiveSessionId");

      if (storedSessions) {
        const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
        // Validate and normalize sessions
        const validatedSessions = parsedSessions.map((session) => ({
          ...session,
          nativeLanguage: session.nativeLanguage || DEFAULT_NATIVE_LANGUAGE,
          learningLanguage: session.learningLanguage || DEFAULT_LEARNING_LANGUAGE,
        }));

        dispatch({
          type: "INITIALIZE",
          payload: {
            sessions: validatedSessions,
            currentSessionId: lastSessionId || undefined,
          },
        });
      } else {
        dispatch({ type: "INITIALIZE", payload: { sessions: [] } });
      }
    } catch (error) {
      console.error("Failed to load sessions from localStorage:", error);
      dispatch({ type: "INITIALIZE", payload: { sessions: [] } });
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined" || !state.isInitialized) return;

    try {
      localStorage.setItem("chatSessions", JSON.stringify(state.sessions));
    } catch (error) {
      console.error("Failed to save sessions to localStorage:", error);
    }
  }, [state.sessions, state.isInitialized]);

  // Save current session ID to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !state.currentSession || !state.isInitialized) return;

    try {
      localStorage.setItem("lastActiveSessionId", state.currentSession.id);
    } catch (error) {
      console.error("Failed to save current session ID to localStorage:", error);
    }
  }, [state.currentSession, state.isInitialized]);

  const createSession = useCallback(
    (
      nativeLanguage: string = DEFAULT_NATIVE_LANGUAGE,
      learningLanguage: string = DEFAULT_LEARNING_LANGUAGE
    ) => {
      const sessionNumber = state.sessions.length + 1;
      const newSession: ChatSession = {
        id: uuidv4(),
        name: `Session ${sessionNumber}`,
        messages: [],
        createdAt: Date.now(),
        nativeLanguage,
        learningLanguage,
      };
      dispatch({ type: "CREATE_SESSION", payload: newSession });
    },
    [state.sessions.length]
  );

  const loadSession = useCallback((sessionId: string) => {
    dispatch({ type: "LOAD_SESSION", payload: sessionId });
  }, []);

  const updateCurrentSessionMessages = useCallback(
    (newMessages: Message[]) => {
      if (state.currentSession) {
        dispatch({
          type: "UPDATE_MESSAGES",
          payload: { sessionId: state.currentSession.id, messages: newMessages },
        });
      }
    },
    [state.currentSession]
  );

  const updateSessionLanguages = useCallback(
    (sessionId: string, nativeLanguage: string, learningLanguage: string) => {
      dispatch({
        type: "UPDATE_LANGUAGES",
        payload: { sessionId, nativeLanguage, learningLanguage },
      });
    },
    []
  );

  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: "DELETE_SESSION", payload: sessionId });
  }, []);

  return (
    <ChatSessionContext.Provider
      value={{
        ...state,
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
