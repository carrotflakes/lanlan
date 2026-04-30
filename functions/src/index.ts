import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { completeText } from "./ai.js";
import { buildConversationInput, parseAnnotations, providerLabel, supportPrompt } from "./prompts.js";
import type { AiProvider, ChatMessage, Profile } from "./types.js";

initializeApp();

const db = getFirestore();
const region = "asia-northeast1";
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const openaiApiKey = defineSecret("OPENAI_API_KEY");
const callableBaseOptions = {
  region,
  cors: true,
  invoker: "public" as const,
  enforceAppCheck: false
};

export const sendMessage = onCall(
  {
    ...callableBaseOptions,
    secrets: [geminiApiKey, openaiApiKey]
  },
  async (request) => {
    const uid = requireUid(request.auth?.uid);
    const { sessionId, content } = parseSendMessageInput(request.data);
    const profile = await loadProfile(uid);
    const provider = profile.aiProvider;
    const session = db.doc(`users/${uid}/sessions/${sessionId}`);
    const sessionSnapshot = await session.get();

    if (!sessionSnapshot.exists) {
      throw new HttpsError("not-found", "Session was not found.");
    }

    const history = await loadRecentHistory(uid, sessionId);
    const userMessageRef = db.collection(`users/${uid}/sessions/${sessionId}/messages`).doc();
    const assistantMessageRef = db.collection(`users/${uid}/sessions/${sessionId}/messages`).doc();
    const now = FieldValue.serverTimestamp();

    await userMessageRef.set({
      role: "user",
      content,
      createdAt: now
    });

    const apiKey = await resolveProviderApiKey(uid, provider);
    const completionInput = buildConversationInput(profile, history, content);
    const assistantText = await completeText({
      provider,
      system: completionInput.system,
      messages: completionInput.messages,
      apiKey
    });

    await db.runTransaction(async (transaction) => {
      transaction.set(assistantMessageRef, {
        role: "assistant",
        content: assistantText,
        provider,
        createdAt: FieldValue.serverTimestamp()
      });
      transaction.update(session, {
        updatedAt: FieldValue.serverTimestamp(),
        lastMessageAt: FieldValue.serverTimestamp()
      });
    });

    return {
      assistantMessageId: assistantMessageRef.id,
      provider: providerLabel(provider)
    };
  }
);

export const generateSupport = onCall(
  {
    ...callableBaseOptions,
    secrets: [geminiApiKey, openaiApiKey]
  },
  async (request) => {
    const uid = requireUid(request.auth?.uid);
    const { sessionId, messageId, mode } = parseGenerateSupportInput(request.data);
    const profile = await loadProfile(uid);
    const provider = profile.aiProvider;
    const messageRef = db.doc(`users/${uid}/sessions/${sessionId}/messages/${messageId}`);
    const snapshot = await messageRef.get();

    if (!snapshot.exists) {
      throw new HttpsError("not-found", "Message was not found.");
    }

    const message = snapshot.data();
    if (message?.role !== "assistant" || typeof message.content !== "string") {
      throw new HttpsError("failed-precondition", "Support can only be generated for assistant messages.");
    }

    const apiKey = await resolveProviderApiKey(uid, provider);
    const result = await completeText({
      provider,
      system: "You provide concise language learning support.",
      messages: [
        {
          role: "user",
          content: supportPrompt(mode, profile, message.content)
        }
      ],
      apiKey
    });

    if (mode === "translate") {
      await messageRef.update({
        translation: result.trim()
      });
    } else {
      await messageRef.update({
        annotations: parseAnnotations(result)
      });
    }

    return { ok: true };
  }
);

export const getProviderStatus = onCall(
  {
    ...callableBaseOptions,
    secrets: [geminiApiKey, openaiApiKey]
  },
  async (request) => {
    const uid = requireUid(request.auth?.uid);
    const openaiAllowed = await canUseOpenAI(uid);

    return {
      geminiAvailable: Boolean(geminiApiKey.value()),
      openaiAvailable: Boolean(openaiApiKey.value()),
      openaiAllowed
    };
  }
);

async function loadProfile(uid: string): Promise<Profile> {
  const snapshot = await db.doc(`users/${uid}/profile/settings`).get();
  const data = snapshot.data() || {};

  return {
    nativeLanguage: typeof data.nativeLanguage === "string" ? data.nativeLanguage : "ja",
    targetLanguage: typeof data.targetLanguage === "string" ? data.targetLanguage : "en",
    uiLanguage: typeof data.uiLanguage === "string" ? data.uiLanguage : "ja",
    theme: data.theme === "light" || data.theme === "dark" || data.theme === "system" ? data.theme : "system",
    aiProvider: data.aiProvider === "openai" ? "openai" : "gemini"
  };
}

async function loadRecentHistory(uid: string, sessionId: string): Promise<ChatMessage[]> {
  const snapshot = await db
    .collection(`users/${uid}/sessions/${sessionId}/messages`)
    .orderBy("createdAt", "desc")
    .limit(12)
    .get();

  return snapshot.docs
    .map((doc) => doc.data())
    .reverse()
    .filter((data) => isHistoryRole(data.role) && typeof data.content === "string")
    .map((data) => ({
      role: data.role,
      content: data.content
    }));
}

async function resolveProviderApiKey(uid: string, provider: AiProvider) {
  if (provider === "gemini") {
    const key = geminiApiKey.value();
    if (!key) {
      throw new HttpsError("failed-precondition", "Gemini API key is not configured.");
    }

    return key;
  }

  const key = openaiApiKey.value();
  if (!key) {
    throw new HttpsError("failed-precondition", "OpenAI API key is not configured.");
  }

  if (!(await canUseOpenAI(uid))) {
    throw new HttpsError("permission-denied", "OpenAI access is not enabled for this account.");
  }

  return key;
}

async function canUseOpenAI(uid: string) {
  const snapshot = await db.doc(`users/${uid}/permissions/openai`).get();
  return snapshot.data()?.enabled === true;
}

function requireUid(uid: string | undefined) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  return uid;
}

function parseSendMessageInput(data: unknown) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Request data is required.");
  }

  const value = data as Record<string, unknown>;
  const sessionId = typeof value.sessionId === "string" ? value.sessionId.trim() : "";
  const content = typeof value.content === "string" ? value.content.trim() : "";

  if (!sessionId) {
    throw new HttpsError("invalid-argument", "sessionId is required.");
  }

  if (!content || content.length > 4000) {
    throw new HttpsError("invalid-argument", "content must be 1-4000 characters.");
  }

  return { sessionId, content };
}

function parseGenerateSupportInput(data: unknown): {
  sessionId: string;
  messageId: string;
  mode: "translate" | "annotate";
} {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Request data is required.");
  }

  const value = data as Record<string, unknown>;
  const sessionId = typeof value.sessionId === "string" ? value.sessionId.trim() : "";
  const messageId = typeof value.messageId === "string" ? value.messageId.trim() : "";
  const mode = value.mode;

  if (!sessionId || !messageId || (mode !== "translate" && mode !== "annotate")) {
    throw new HttpsError("invalid-argument", "sessionId, messageId, and mode are required.");
  }

  return { sessionId, messageId, mode };
}

function isHistoryRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

export const __test = {
  parseSendMessageInput,
  parseGenerateSupportInput
};
