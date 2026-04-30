import type { AiProvider, Profile, ThemePreference } from "../types";
import { defaultProfile, languages } from "../types";

export function normalizeProfile(input: Partial<Profile> | null | undefined): Profile {
  const nativeLanguage = input?.nativeLanguage;
  const targetLanguage = input?.targetLanguage;
  const uiLanguage = input?.uiLanguage;

  return {
    nativeLanguage: nativeLanguage && languages.includes(nativeLanguage)
      ? nativeLanguage
      : defaultProfile.nativeLanguage,
    targetLanguage: targetLanguage && languages.includes(targetLanguage)
      ? targetLanguage
      : defaultProfile.targetLanguage,
    uiLanguage: uiLanguage && languages.includes(uiLanguage)
      ? uiLanguage
      : defaultProfile.uiLanguage,
    theme: isTheme(input?.theme) ? input.theme : defaultProfile.theme,
    aiProvider: isProvider(input?.aiProvider) ? input.aiProvider : defaultProfile.aiProvider,
    autoPlayAssistantAudio:
      typeof input?.autoPlayAssistantAudio === "boolean"
        ? input.autoPlayAssistantAudio
        : defaultProfile.autoPlayAssistantAudio
  };
}

export function nextResolvedTheme(theme: ThemePreference, prefersDark: boolean): "light" | "dark" {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }

  return theme;
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function isProvider(value: unknown): value is AiProvider {
  return value === "gemini" || value === "openai";
}
