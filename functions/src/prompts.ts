import type { AiProvider, Annotation } from "./types.js";

type PromptProfile = {
  nativeLanguage: string;
  targetLanguage: string;
};

type PromptMessage = {
  role: "user" | "assistant";
  content: string;
};

export function conversationSystemPrompt(profile: PromptProfile) {
  return [
    "You are LanLan, a friendly language practice partner.",
    `The learner's native language is ${profile.nativeLanguage}.`,
    `The learner is practicing ${profile.targetLanguage}.`,
    "Reply mainly in the practice language.",
    "Keep replies short, natural, and easy to answer.",
    "Ask one simple follow-up question when it fits.",
    "Do not over-explain unless the learner asks."
  ].join("\n");
}

export function supportPrompt(
  mode: "translate" | "annotate",
  profile: PromptProfile,
  message: string
) {
  if (mode === "translate") {
    return [
      `Translate this ${profile.targetLanguage} message into ${profile.nativeLanguage}.`,
      "Return only the translation.",
      "",
      message
    ].join("\n");
  }

  return [
    `Explain important words or phrases in this ${profile.targetLanguage} message for a ${profile.nativeLanguage} speaker.`,
    "Return compact JSON only, with this shape:",
    '[{"phrase":"...","meaning":"...","note":"..."}]',
    "Choose at most 4 useful items.",
    "",
    message
  ].join("\n");
}

export function buildConversationInput(
  profile: PromptProfile,
  history: PromptMessage[],
  latestUserMessage: string
) {
  return {
    system: conversationSystemPrompt(profile),
    messages: [
      ...history.map((message) => ({
        role: message.role,
        content: message.content
      })),
      {
        role: "user" as const,
        content: latestUserMessage
      }
    ]
  };
}

export function parseAnnotations(raw: string): Annotation[] {
  const json = extractJson(raw);

  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return fallbackAnnotation(raw);
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        phrase: String(item.phrase || "").slice(0, 80),
        meaning: String(item.meaning || "").slice(0, 200),
        note: String(item.note || "").slice(0, 240)
      }))
      .filter((item) => item.phrase && item.meaning)
      .slice(0, 4);
  } catch {
    return fallbackAnnotation(raw);
  }
}

export function providerLabel(provider: AiProvider) {
  return provider === "openai" ? "OpenAI" : "Gemini";
}

function extractJson(raw: string) {
  const trimmed = raw.trim();
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");

  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }

  return trimmed;
}

function fallbackAnnotation(raw: string): Annotation[] {
  const text = raw.trim();
  if (!text) {
    return [];
  }

  return [
    {
      phrase: "Note",
      meaning: text.slice(0, 200),
      note: "Generated as a general explanation because the model did not return structured notes."
    }
  ];
}
