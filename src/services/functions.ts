import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import type { ProviderStatus } from "../types";

type SendMessageInput = {
  sessionId: string;
  content: string;
};

type GenerateSupportInput = {
  sessionId: string;
  messageId: string;
  mode: "translate" | "annotate";
};

export async function sendMessage(input: SendMessageInput) {
  const callable = httpsCallable<SendMessageInput, { assistantMessageId: string }>(
    functions,
    "sendMessage"
  );
  return (await callable(input)).data;
}

export async function generateSupport(input: GenerateSupportInput) {
  const callable = httpsCallable<GenerateSupportInput, { ok: true }>(functions, "generateSupport");
  return (await callable(input)).data;
}

export async function getProviderStatus() {
  const callable = httpsCallable<void, ProviderStatus>(functions, "getProviderStatus");
  return (await callable()).data;
}
