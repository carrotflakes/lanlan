export type LanguageCode = "ja" | "en" | "ko" | "zh-Hans" | "zh-Hant" | "es" | "fr" | "de";

export type ThemePreference = "light" | "dark" | "system";

export type AiProvider = "gemini" | "openai";

export type Profile = {
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  uiLanguage: LanguageCode;
  theme: ThemePreference;
  aiProvider: AiProvider;
  autoPlayAssistantAudio: boolean;
  preloadAnnotations: boolean;
};

export type Session = {
  id: string;
  title: string;
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
};

export type Annotation = {
  phrase: string;
  meaning: string;
  note: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  annotations?: Annotation[];
  provider?: AiProvider;
  createdAt: Date;
};

export type ProviderStatus = {
  geminiAvailable: boolean;
  openaiAvailable: boolean;
  openaiAllowed: boolean;
};

export const defaultProfile: Profile = {
  nativeLanguage: "ja",
  targetLanguage: "en",
  uiLanguage: "ja",
  theme: "system",
  aiProvider: "gemini",
  autoPlayAssistantAudio: false,
  preloadAnnotations: false
};

export const languageNames: Record<LanguageCode, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch"
};

export const languages = Object.keys(languageNames) as LanguageCode[];
