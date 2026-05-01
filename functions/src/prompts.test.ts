import { describe, expect, it } from "vitest";
import { buildConversationInput, conversationSystemPrompt, parseAnnotations, supportPrompt } from "./prompts.js";

describe("prompts", () => {
  it("builds a concise conversation system prompt", () => {
    const prompt = conversationSystemPrompt({ nativeLanguage: "ja", targetLanguage: "en" });

    expect(prompt).toContain("native language is ja");
    expect(prompt).toContain("practicing en");
    expect(prompt).toContain("Keep replies short");
  });

  it("appends the latest user message after history", () => {
    const input = buildConversationInput(
      { nativeLanguage: "ja", targetLanguage: "en" },
      [{ role: "assistant", content: "Hi!" }],
      "How are you?"
    );

    expect(input.messages).toEqual([
      { role: "assistant", content: "Hi!" },
      { role: "user", content: "How are you?" }
    ]);
  });

  it("builds separate support prompts", () => {
    expect(supportPrompt("translate", { nativeLanguage: "ja", targetLanguage: "en" }, "Hello")).toContain(
      "Return only the translation"
    );
    expect(supportPrompt("annotate", { nativeLanguage: "ja", targetLanguage: "en" }, "Hello")).toContain(
      "compact JSON"
    );
  });

  it("parses annotations from JSON wrapped in model prose", () => {
    expect(
      parseAnnotations('Here: [{"phrase":"How are you?","meaning":"元気ですか","note":"挨拶"}]')
    ).toEqual([
      {
        phrase: "How are you?",
        meaning: "元気ですか",
        note: "挨拶"
      }
    ]);
  });

  it("parses annotations from structured output wrapper JSON", () => {
    expect(
      parseAnnotations('Here: {"annotations":[{"phrase":"take off","meaning":"離陸する","note":"飛行機に使う句動詞"}]}')
    ).toEqual([
      {
        phrase: "take off",
        meaning: "離陸する",
        note: "飛行機に使う句動詞"
      }
    ]);
  });
});
