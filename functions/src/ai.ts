import { HttpsError } from "firebase-functions/v2/https";
import type { AiProvider, ChatMessage } from "./types.js";

type CompletionInput = {
  provider: AiProvider;
  system: string;
  messages: ChatMessage[];
  apiKey: string;
  structuredOutput?: StructuredOutput;
};

export type JsonSchema = {
  type: "array" | "object" | "string";
  additionalProperties?: boolean;
  description?: string;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
};

export type StructuredOutput = {
  name: string;
  description?: string;
  schema: JsonSchema;
  strict?: boolean;
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
          maxOutputTokens: 360,
          ...(input.structuredOutput
            ? {
                responseMimeType: "application/json",
                responseSchema: toGeminiSchema(input.structuredOutput.schema)
              }
            : {})
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
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: input.system,
      input: input.messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      max_output_tokens: 1000,
      reasoning: {
        effort: "low",
      },
      ...(input.structuredOutput ? { text: { format: toOpenAiTextFormat(input.structuredOutput) } } : {})
    })
  });

  if (!response.ok) {
    throw new HttpsError(
      "internal",
      `OpenAI request failed with status ${response.status}: ${await responseErrorText(response)}`
    );
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
        refusal?: string;
      }>;
    }>;
  };
  const refusal = data.output?.flatMap((item) => item.content || []).find((content) => content.refusal)?.refusal;
  if (refusal) {
    throw new HttpsError("failed-precondition", `OpenAI refused the request: ${refusal}`);
  }

  const text =
    data.output_text?.trim() ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new HttpsError("internal", "OpenAI returned an empty response.");
  }

  return text;
}

function toGeminiSchema(schema: JsonSchema): Record<string, unknown> {
  return {
    type: schema.type.toUpperCase(),
    ...(schema.description ? { description: schema.description } : {}),
    ...(schema.items ? { items: toGeminiSchema(schema.items) } : {}),
    ...(schema.properties
      ? {
          properties: Object.fromEntries(
            Object.entries(schema.properties).map(([key, value]) => [key, toGeminiSchema(value)])
          )
        }
      : {}),
    ...(schema.required ? { required: schema.required } : {})
  };
}

function toOpenAiTextFormat(output: StructuredOutput) {
  return {
    type: "json_schema",
    name: output.name,
    ...(output.description ? { description: output.description } : {}),
    strict: output.strict ?? true,
    schema: output.schema
  };
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
