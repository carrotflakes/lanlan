import { describe, expect, it } from "vitest";
import { normalizeProfile, nextResolvedTheme } from "./preferences";

describe("preferences", () => {
  it("fills missing values with app defaults", () => {
    expect(normalizeProfile({ targetLanguage: "ko" })).toMatchObject({
      nativeLanguage: "ja",
      targetLanguage: "ko",
      uiLanguage: "ja",
      theme: "system",
      aiProvider: "gemini"
    });
  });

  it("ignores unsupported values", () => {
    expect(
      normalizeProfile({
        nativeLanguage: "xx",
        theme: "neon",
        aiProvider: "local"
      } as never)
    ).toMatchObject({
      nativeLanguage: "ja",
      theme: "system",
      aiProvider: "gemini"
    });
  });

  it("resolves system theme from media preference", () => {
    expect(nextResolvedTheme("system", true)).toBe("dark");
    expect(nextResolvedTheme("system", false)).toBe("light");
    expect(nextResolvedTheme("light", true)).toBe("light");
  });
});
