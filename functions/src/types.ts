export type AiProvider = "gemini" | "openai";

export type Profile = {
  nativeLanguage: string;
  targetLanguage: string;
  uiLanguage: string;
  theme: "light" | "dark" | "system";
  aiProvider: AiProvider;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Annotation = {
  phrase: string;
  meaning: string;
  note: string;
};
