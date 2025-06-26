"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface LanguageContextType {
  nativeLanguage: string;
  learningLanguage: string;
  setNativeLanguage: (lang: string) => void;
  setLearningLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguageState] = useState("English");
  const [learningLanguage, setLearningLanguageState] = useState("Japanese");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedNativeLanguage = localStorage.getItem("nativeLanguage");
      const storedLearningLanguage = localStorage.getItem("learningLanguage");
      if (storedNativeLanguage) {
        setNativeLanguageState(storedNativeLanguage);
      }
      if (storedLearningLanguage) {
        setLearningLanguageState(storedLearningLanguage);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nativeLanguage", nativeLanguage);
    }
  }, [nativeLanguage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("learningLanguage", learningLanguage);
    }
  }, [learningLanguage]);

  const setNativeLanguage = (lang: string) => {
    setNativeLanguageState(lang);
  };

  const setLearningLanguage = (lang: string) => {
    setLearningLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        nativeLanguage,
        learningLanguage,
        setNativeLanguage,
        setLearningLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
