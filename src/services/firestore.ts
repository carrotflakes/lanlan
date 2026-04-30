import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Timestamp,
  type Unsubscribe
} from "firebase/firestore";
import { db } from "../firebase";
import { normalizeProfile } from "../domain/preferences";
import type { ChatMessage, Profile, Session } from "../types";

export function profileRef(uid: string) {
  return doc(db, "users", uid, "profile", "settings");
}

export function sessionsRef(uid: string) {
  return collection(db, "users", uid, "sessions");
}

export function sessionRef(uid: string, sessionId: string) {
  return doc(db, "users", uid, "sessions", sessionId);
}

export function messagesRef(uid: string, sessionId: string) {
  return collection(db, "users", uid, "sessions", sessionId, "messages");
}

export function subscribeProfile(
  uid: string,
  onValue: (profile: Profile) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(
    profileRef(uid),
    async (snapshot) => {
      if (!snapshot.exists()) {
        const profile = normalizeProfile(null);
        await setDoc(profileRef(uid), {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        onValue(profile);
        return;
      }

      onValue(normalizeProfile(snapshot.data()));
    },
    onError
  );
}

export async function saveProfile(uid: string, profile: Profile) {
  await setDoc(
    profileRef(uid),
    {
      ...profile,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export function subscribeSessions(
  uid: string,
  onValue: (sessions: Session[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe {
  const sessionsQuery = query(sessionsRef(uid), orderBy("updatedAt", "desc"), limit(50));

  return onSnapshot(
    sessionsQuery,
    (snapshot) => {
      onValue(snapshot.docs.map(mapSession));
    },
    onError
  );
}

export async function createSession(uid: string, profile: Profile) {
  const title = `${languageTitle(profile.targetLanguage)} practice`;
  const created = await addDoc(sessionsRef(uid), {
    title,
    nativeLanguage: profile.nativeLanguage,
    targetLanguage: profile.targetLanguage,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: null
  });

  return created.id;
}

export async function deleteSession(uid: string, sessionId: string) {
  const batch = writeBatch(db);
  const messageSnapshots = await getDocs(messagesRef(uid, sessionId));

  messageSnapshots.forEach((message) => {
    batch.delete(message.ref);
  });

  batch.delete(sessionRef(uid, sessionId));
  await batch.commit();
}

export async function renameSession(uid: string, sessionId: string, title: string) {
  await updateDoc(sessionRef(uid, sessionId), {
    title: title.trim() || "Untitled session",
    updatedAt: serverTimestamp()
  });
}

export function subscribeMessages(
  uid: string,
  sessionId: string,
  onValue: (messages: ChatMessage[]) => void,
  onError: (error: FirestoreError) => void
): Unsubscribe {
  const messagesQuery = query(messagesRef(uid, sessionId), orderBy("createdAt", "asc"), limit(120));

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onValue(snapshot.docs.map(mapMessage));
    },
    onError
  );
}

function mapSession(snapshot: QueryDocumentSnapshot<DocumentData>): Session {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: String(data.title || "Untitled session"),
    nativeLanguage: data.nativeLanguage,
    targetLanguage: data.targetLanguage,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    lastMessageAt: data.lastMessageAt ? toDate(data.lastMessageAt) : null
  };
}

function mapMessage(snapshot: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    role: data.role === "assistant" ? "assistant" : "user",
    content: String(data.content || ""),
    translation: typeof data.translation === "string" ? data.translation : undefined,
    annotations: Array.isArray(data.annotations) ? data.annotations : undefined,
    provider: data.provider === "openai" ? "openai" : data.provider === "gemini" ? "gemini" : undefined,
    createdAt: toDate(data.createdAt)
  };
}

function toDate(value: Timestamp | Date | undefined): Date {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  return value.toDate();
}

function languageTitle(language: string): string {
  const names: Record<string, string> = {
    ja: "Japanese",
    en: "English",
    ko: "Korean",
    "zh-Hans": "Simplified Chinese",
    "zh-Hant": "Traditional Chinese",
    es: "Spanish",
    fr: "French",
    de: "German"
  };

  return names[language] || language.toUpperCase();
}
