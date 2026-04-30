import { HttpsError } from "firebase-functions/v2/https";
import type { AiProvider, ChatMessage } from "./types.js";

type CompletionInput = {
  provider: AiProvider;
  system: string;
  messages: ChatMessage[];
  apiKey: string;
};

export async function completeText(input: CompletionInput) {
  if (input.provider === "openai") {
    return completeWithOpenAI(input);
  }

  return completeWithGemini(input);
}

async function completeWithGemini(input: CompletionInput) {
  const model = normalizeGeminiModel(process.env.GEMINI_MODEL || "models/gemini-2.5-flash-lite");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${encodeURIComponent(
      input.apiKey
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: input.system }]
        },
        contents: input.messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }]
        })),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 360
        }
      })
    }
  );

  if (!response.ok) {
    throw new HttpsError(
      "internal",
      `Gemini request failed with status ${response.status}: ${await responseErrorText(response)}`
    );
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new HttpsError("internal", "Gemini returned an empty response.");
  }

  return text;
}

async function completeWithOpenAI(input: CompletionInput) {
  const model = process.env.OPENAI_MODEL || "gpt-5-nano";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 360,
      messages: [
        {
          role: "system",
          content: input.system
        },
        ...input.messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    })
  });

  if (!response.ok) {
    throw new HttpsError(
      "internal",
      `OpenAI request failed with status ${response.status}: ${await responseErrorText(response)}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new HttpsError("internal", "OpenAI returned an empty response.");
  }

  return text;
}

function normalizeGeminiModel(model: string) {
  const trimmed = model.trim();
  return trimmed.startsWith("models/") ? trimmed : `models/${trimmed}`;
}

async function responseErrorText(response: Response) {
  const body = await response.text();

  if (!body) {
    return response.statusText || "No response body.";
  }

  return body.replace(/\s+/g, " ").slice(0, 500);
}
