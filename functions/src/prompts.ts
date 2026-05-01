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
    "You are an assistant for language learners.",
    `The learner is practicing ${profile.targetLanguage}. Extract useful words, phrases, and idioms for a ${profile.nativeLanguage} speaker.`,
    "",
    "For each item, preserve the exact original form and provide a brief meaning plus a short usage, grammar, or context note.",
    `Write meaning and note in ${profile.nativeLanguage}.`,
    "Include important content words and idiomatic expressions.",
    "Return compact JSON only, with this shape:",
    '{"annotations":[{"phrase":"...","meaning":"...","note":"..."}]}',
    "",
    `Text to analyze: "${message}"`
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
  try {
    const parsed = parseJsonFromText(raw);
    const annotations = Array.isArray(parsed) ? parsed : isRecord(parsed) ? parsed.annotations : undefined;

    if (!Array.isArray(annotations)) {
      return fallbackAnnotation(raw);
    }

    return annotations
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseJsonFromText(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstObject = trimmed.indexOf("{");
    const firstArray = trimmed.indexOf("[");
    const startsWithObject = firstObject >= 0 && (firstArray === -1 || firstObject < firstArray);
    const start = startsWithObject ? firstObject : firstArray;
    const end = startsWithObject ? trimmed.lastIndexOf("}") : trimmed.lastIndexOf("]");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("No JSON found.");
  }
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
