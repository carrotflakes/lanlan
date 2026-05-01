import {
  Bot,
  ChevronLeft,
  Languages,
  LogIn,
  LogOut,
  Menu,
  MessageSquarePlus,
  Moon,
  Play,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  UserCircle,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { isFirebaseConfigured } from "./firebase";
import { getUiText, type UiText } from "./i18n";
import { useAuth } from "./hooks/useAuth";
import { nextResolvedTheme } from "./domain/preferences";
import {
  createSession,
  deleteSession,
  saveProfile,
  subscribeMessages,
  subscribeProfile,
  subscribeSessions
} from "./services/firestore";
import {
  generateSupport,
  getProviderStatus,
  sendMessage
} from "./services/functions";
import {
  defaultProfile,
  languageNames,
  languages,
  type Annotation,
  type ChatMessage,
  type LanguageCode,
  type Profile,
  type ProviderStatus,
  type Session
} from "./types";

export function App() {
  const {
    user,
    loading: authLoading,
    actionLoading: authActionLoading,
    error: authError,
    signInWithGoogle,
    signOutToAnonymous
  } = useAuth();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [busy, setBusy] = useState(false);
  const [supportBusy, setSupportBusy] = useState<string | null>(null);
  const [preloadingAnnotationIds, setPreloadingAnnotationIds] = useState<Set<string>>(() => new Set());
  const [visibleTranslations, setVisibleTranslations] = useState<Set<string>>(() => new Set());
  const [visibleNotes, setVisibleNotes] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    geminiAvailable: false,
    openaiAvailable: false,
    openaiAllowed: false
  });
  const draftSessionRef = useRef(false);
  const seenAssistantMessageIdsRef = useRef<Set<string>>(new Set());
  const messagesInitializedRef = useRef(false);

  const activeSession = sessions.find((session) => session.id === selectedSessionId) ?? null;
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const t = useMemo(() => getUiText(profile.uiLanguage), [profile.uiLanguage]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.dataset.theme = nextResolvedTheme(profile.theme, media.matches);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [profile.theme]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return subscribeProfile(
      user.uid,
      setProfile,
      (firestoreError) => setError(firestoreError.message)
    );
  }, [user]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    return subscribeSessions(
      user.uid,
      (nextSessions) => {
        setSessions(nextSessions);
        setSelectedSessionId((current) =>
          draftSessionRef.current ? null : current ?? nextSessions[0]?.id ?? null
        );
      },
      (firestoreError) => setError(firestoreError.message)
    );
  }, [user]);

  useEffect(() => {
    if (!user || !selectedSessionId) {
      setMessages([]);
      seenAssistantMessageIdsRef.current = new Set();
      messagesInitializedRef.current = false;
      return undefined;
    }

    setVisibleTranslations(new Set());
    setVisibleNotes(new Set());
    setPreloadingAnnotationIds(new Set());
    seenAssistantMessageIdsRef.current = new Set();
    messagesInitializedRef.current = false;

    return subscribeMessages(
      user.uid,
      selectedSessionId,
      setMessages,
      (firestoreError) => setError(firestoreError.message)
    );
  }, [selectedSessionId, user]);

  useEffect(() => {
    const assistantIds = new Set(
      messages.filter((message) => message.role === "assistant").map((message) => message.id)
    );

    if (!messagesInitializedRef.current) {
      seenAssistantMessageIdsRef.current = assistantIds;
      messagesInitializedRef.current = true;
      return;
    }

    const newAssistantMessages = messages.filter(
      (message) => message.role === "assistant" && !seenAssistantMessageIdsRef.current.has(message.id)
    );

    seenAssistantMessageIdsRef.current = assistantIds;

    if (!profile.autoPlayAssistantAudio || !speechSupported || newAssistantMessages.length === 0) {
      return;
    }

    speak(newAssistantMessages[newAssistantMessages.length - 1]);
  }, [messages, profile.autoPlayAssistantAudio, speechSupported]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void refreshProviderStatus();
  }, [user]);

  async function refreshProviderStatus() {
    try {
      setProviderStatus(await getProviderStatus());
    } catch (providerError) {
      setError(errorMessage(providerError, t.genericError));
    }
  }

  async function updateProfile(nextProfile: Profile) {
    setProfile(nextProfile);
    if (user) {
      await saveProfile(user.uid, nextProfile);
      if (nextProfile.aiProvider !== profile.aiProvider) {
        await refreshProviderStatus();
      }
    }
  }

  function startSession() {
    draftSessionRef.current = true;
    setError(null);
    setSelectedSessionId(null);
    setMessages([]);
    setVisibleTranslations(new Set());
    setVisibleNotes(new Set());
    setPreloadingAnnotationIds(new Set());
    setDrawerOpen(false);
  }

  async function removeSession(sessionId: string) {
    if (!user) {
      return;
    }

    const session = sessions.find((item) => item.id === sessionId);
    if (!window.confirm(t.confirmDeleteSession(session?.title ?? t.startConversation))) {
      return;
    }

    await deleteSession(user.uid, sessionId);
    setSelectedSessionId((current) => (current === sessionId ? null : current));
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();

    const content = composer.trim();
    if (!content || busy || !user) {
      return;
    }

    if (
      profile.aiProvider === "openai" &&
      (!providerStatus.openaiAvailable || !providerStatus.openaiAllowed)
    ) {
      setSettingsOpen(true);
      setError(t.openaiUnavailable);
      return;
    }

    try {
      setBusy(true);
      setError(null);
      setComposer("");
      let sessionId = selectedSessionId;

      if (!sessionId) {
        sessionId = await createSession(user.uid, profile);
        draftSessionRef.current = false;
        setSelectedSessionId(sessionId);
      }

      const result = await sendMessage({ sessionId, content });
      if (profile.preloadAnnotations) {
        void preloadAnnotationsForMessage(sessionId, result.assistantMessageId);
      }
    } catch (sendError) {
      setComposer(content);
      setError(errorMessage(sendError, t.genericError));
    } finally {
      setBusy(false);
    }
  }

  async function handleSupport(message: ChatMessage, mode: "translate" | "annotate") {
    if (!selectedSessionId) {
      return;
    }

    const isTranslate = mode === "translate";
    const isAlreadyVisible = isTranslate
      ? visibleTranslations.has(message.id)
      : visibleNotes.has(message.id);
    const hasCachedSupport = isTranslate
      ? Boolean(message.translation)
      : Boolean(message.annotations?.length);

    if (isAlreadyVisible) {
      toggleSupportVisibility(message.id, mode);
      return;
    }

    if (hasCachedSupport) {
      toggleSupportVisibility(message.id, mode);
      return;
    }

    if (!isTranslate && preloadingAnnotationIds.has(message.id)) {
      showSupport(message.id, mode);
      return;
    }

    try {
      setSupportBusy(`${message.id}:${mode}`);
      setError(null);
      await generateSupport({ sessionId: selectedSessionId, messageId: message.id, mode });
      showSupport(message.id, mode);
    } catch (supportError) {
      setError(errorMessage(supportError, t.genericError));
    } finally {
      setSupportBusy(null);
    }
  }

  async function preloadAnnotationsForMessage(sessionId: string, messageId: string) {
    setPreloadingAnnotationIds((current) => {
      const next = new Set(current);
      next.add(messageId);
      return next;
    });

    try {
      await generateSupport({ sessionId, messageId, mode: "annotate" });
    } catch (preloadError) {
      console.warn("Failed to preload annotations:", preloadError);
      setVisibleNotes((current) => {
        if (!current.has(messageId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(messageId);
        return next;
      });
    } finally {
      setPreloadingAnnotationIds((current) => {
        const next = new Set(current);
        next.delete(messageId);
        return next;
      });
    }
  }

  function toggleSupportVisibility(messageId: string, mode: "translate" | "annotate") {
    const setter = mode === "translate" ? setVisibleTranslations : setVisibleNotes;

    setter((current) => {
      const next = new Set(current);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }

      return next;
    });
  }

  function showSupport(messageId: string, mode: "translate" | "annotate") {
    const setter = mode === "translate" ? setVisibleTranslations : setVisibleNotes;

    setter((current) => {
      const next = new Set(current);
      next.add(messageId);
      return next;
    });
  }

  function speak(message: ChatMessage) {
    if (!speechSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = speechLanguageCode(profile.targetLanguage);
    window.speechSynthesis.speak(utterance);
  }

  const languagePair = useMemo(
    () => {
      const nativeLanguage = activeSession?.nativeLanguage ?? profile.nativeLanguage;
      const targetLanguage = activeSession?.targetLanguage ?? profile.targetLanguage;
      return `${languageNames[nativeLanguage]} → ${languageNames[targetLanguage]}`;
    },
    [activeSession?.nativeLanguage, activeSession?.targetLanguage, profile.nativeLanguage, profile.targetLanguage]
  );

  if (authLoading) {
    return <ShellState title="LanLan" message={t.appLoading} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <button className="icon-button mobile-only" type="button" onClick={() => setDrawerOpen(false)}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="eyebrow">LanLan</p>
            <h1>{t.practiceSessions}</h1>
          </div>
        </div>

        <button className="primary-button full" type="button" onClick={startSession} disabled={!user}>
          <MessageSquarePlus size={18} />
          {t.newSession}
        </button>

        <div className="session-list">
          {sessions.length === 0 ? (
            <p className="muted compact">{t.emptySessions}</p>
          ) : (
            sessions.map((session) => (
              <button
                className={`session-item ${session.id === selectedSessionId ? "is-active" : ""}`}
                key={session.id}
                type="button"
                onClick={() => {
                  draftSessionRef.current = false;
                  setSelectedSessionId(session.id);
                  setDrawerOpen(false);
                }}
              >
                <span>{session.title}</span>
                <small>
                  {languageNames[session.nativeLanguage]} → {languageNames[session.targetLanguage]}
                </small>
              </button>
            ))
          )}
        </div>
      </aside>

      {drawerOpen ? <button className="scrim" type="button" onClick={() => setDrawerOpen(false)} /> : null}

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" onClick={() => setDrawerOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">{languagePair}</p>
            <h2>{activeSession?.title ?? t.startConversation}</h2>
          </div>
          <div className="topbar-actions">
            <div className="account-pill" title={user?.email ?? (user?.isAnonymous ? t.anonymousUser : "")}>
              <UserCircle size={18} />
              <span>{user?.isAnonymous ? t.guest : user?.displayName || user?.email || t.account}</span>
            </div>
            {activeSession ? (
              <button
                className="icon-button danger"
                type="button"
                title={t.deleteSession}
                onClick={() => removeSession(activeSession.id)}
              >
                <Trash2 size={18} />
              </button>
            ) : null}
            <button
              className="icon-button"
              type="button"
              title={t.settings}
              onClick={() => setSettingsOpen((value) => !value)}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {!isFirebaseConfigured ? (
          <div className="notice">
            {t.firebaseMissing}
          </div>
        ) : null}

        {authError ? <div className="notice danger">{authError}</div> : null}
        {error ? (
          <div className="notice danger">
            <span>{error}</span>
            <button className="text-button" type="button" onClick={() => setError(null)}>
              {t.dismiss}
            </button>
          </div>
        ) : null}

        <section className={`workspace ${settingsOpen ? "has-settings" : ""}`}>
          <section className="chat-panel">
            {messages.length === 0 ? (
              <WelcomePanel t={t} profile={profile} onChange={updateProfile} onStart={startSession} />
            ) : (
              <div className="messages">
                {messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    translationVisible={visibleTranslations.has(message.id)}
                    notesVisible={visibleNotes.has(message.id)}
                    supportBusy={supportBusy}
                    speechSupported={speechSupported}
                    t={t}
                    onSupport={handleSupport}
                    onSpeak={speak}
                  />
                ))}
                {busy ? (
                  <article className="message assistant is-pending">
                    <Bot size={18} />
                    <span>{t.thinking}</span>
                  </article>
                ) : null}
              </div>
            )}
          </section>

          <SettingsPanel
            open={settingsOpen}
            profile={profile}
            providerStatus={providerStatus}
            user={user}
            authActionLoading={authActionLoading}
            t={t}
            onClose={() => setSettingsOpen(false)}
            onProfileChange={updateProfile}
            onGoogleSignIn={signInWithGoogle}
            onSignOut={signOutToAnonymous}
          />
        </section>

        <form className="composer" onSubmit={handleSend}>
          <input
            value={composer}
            onChange={(event) => setComposer(event.target.value)}
            placeholder={t.writeInLanguage(languageNames[profile.targetLanguage])}
            disabled={busy || !user}
          />
          <button className="primary-button" type="submit" disabled={busy || !composer.trim()}>
            <Plus size={18} />
            {t.send}
          </button>
        </form>
      </main>
    </div>
  );
}

function WelcomePanel({
  t,
  profile,
  onChange,
  onStart
}: {
  t: UiText;
  profile: Profile;
  onChange: (profile: Profile) => Promise<void>;
  onStart: () => void;
}) {
  return (
    <div className="welcome">
      <div className="welcome-copy">
        <p className="eyebrow">{t.welcomeEyebrow}</p>
        <h2>{t.welcomeTitle}</h2>
      </div>

      <div className="preference-grid">
        <SelectField
          label={t.nativeLanguage}
          value={profile.nativeLanguage}
          onChange={(value) => onChange({ ...profile, nativeLanguage: value })}
        />
        <SelectField
          label={t.practiceLanguage}
          value={profile.targetLanguage}
          onChange={(value) => onChange({ ...profile, targetLanguage: value })}
        />
      </div>

      <button className="primary-button" type="button" onClick={onStart}>
        <MessageSquarePlus size={18} />
        {t.startPractice}
      </button>
    </div>
  );
}

function MessageItem({
  message,
  translationVisible,
  notesVisible,
  supportBusy,
  speechSupported,
  t,
  onSupport,
  onSpeak
}: {
  message: ChatMessage;
  translationVisible: boolean;
  notesVisible: boolean;
  supportBusy: string | null;
  speechSupported: boolean;
  t: UiText;
  onSupport: (message: ChatMessage, mode: "translate" | "annotate") => Promise<void>;
  onSpeak: (message: ChatMessage) => void;
}) {
  const [activePopover, setActivePopover] = useState<{
    annotation: Annotation;
    x: number;
    y: number;
  } | null>(null);
  const activeAnnotationTriggerRef = useRef<HTMLElement | null>(null);
  const activePopoverRef = useRef<HTMLDivElement | null>(null);
  const translationBusy = supportBusy === `${message.id}:translate`;
  const notesBusy = supportBusy === `${message.id}:annotate`;
  const annotations = message.annotations ?? [];
  const hasNotes = annotations.length > 0;

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const stillExists = annotations.some((annotation) => annotation.phrase === activePopover.annotation.phrase);
    if (!stillExists) {
      setActivePopover(null);
    }
  }, [activePopover, annotations]);

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (
        activeAnnotationTriggerRef.current?.contains(target) ||
        activePopoverRef.current?.contains(target)
      ) {
        return;
      }

      setActivePopover(null);
      activeAnnotationTriggerRef.current = null;
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activePopover]);

  return (
    <article className={`message ${message.role}`}>
      <div className="message-body">
        {message.role === "assistant" && hasNotes ? (
          <AnnotatedText
            content={message.content}
            annotations={annotations}
            activeAnnotation={activePopover?.annotation ?? null}
            onAnnotationSelect={(annotation, element) => {
              setActivePopover((current) => {
                if (current?.annotation.phrase === annotation.phrase) {
                  activeAnnotationTriggerRef.current = null;
                  return null;
                }

                activeAnnotationTriggerRef.current = element;
                const rect = element.getBoundingClientRect();
                const width = Math.min(280, window.innerWidth - 24);
                const x = Math.min(Math.max(rect.left + rect.width / 2, width / 2 + 12), window.innerWidth - width / 2 - 12);
                const y = Math.max(rect.top - 10, 12);

                return { annotation, x, y };
              });
            }}
          />
        ) : (
          <p>{message.content}</p>
        )}
      </div>

      {message.role === "assistant" ? (
        <div className="message-tools">
          <button
            className={`tool-button ${translationVisible ? "is-active" : ""}`}
            type="button"
            onClick={() => onSupport(message, "translate")}
            disabled={translationBusy}
          >
            <Languages size={15} />
            {translationBusy ? t.loading : t.translate}
          </button>
          <button
            className={`tool-button ${notesVisible ? "is-active" : ""}`}
            type="button"
            onClick={() => onSupport(message, "annotate")}
            disabled={notesBusy}
          >
            <Sparkles size={15} />
            {notesBusy ? t.loading : t.notes}
          </button>
          <button
            className="tool-button"
            type="button"
            onClick={() => onSpeak(message)}
            disabled={!speechSupported}
          >
            <Play size={15} />
            {t.listen}
          </button>
        </div>
      ) : null}

      {translationVisible && message.translation ? <p className="translation">{message.translation}</p> : null}

      {activePopover ? (
        <AnnotationPopover
          annotation={activePopover.annotation}
          popoverRef={activePopoverRef}
          x={activePopover.x}
          y={activePopover.y}
        />
      ) : null}

      {notesVisible && message.annotations?.length ? (
        <div className="annotations">
          {message.annotations.map((annotation) => (
            <div className="annotation" key={`${message.id}:${annotation.phrase}`}>
              <strong>{annotation.phrase}</strong>
              <span>{annotation.meaning}</span>
              <small>{annotation.note}</small>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function AnnotatedText({
  content,
  annotations,
  activeAnnotation,
  onAnnotationSelect
}: {
  content: string;
  annotations: Annotation[];
  activeAnnotation: Annotation | null;
  onAnnotationSelect: (annotation: Annotation, element: HTMLElement) => void;
}) {
  const segments = buildAnnotatedSegments(content, annotations);

  return (
    <p>
      {segments.map((segment, index) =>
        segment.annotation ? (
          <button
            className={`annotated-phrase ${
              activeAnnotation?.phrase === segment.annotation.phrase ? "is-active" : ""
            }`}
            key={`${segment.text}:${index}`}
            type="button"
            onClick={(event) => onAnnotationSelect(segment.annotation!, event.currentTarget)}
          >
            {segment.text}
          </button>
        ) : (
          <span key={`${segment.text}:${index}`}>{segment.text}</span>
        )
      )}
    </p>
  );
}

function AnnotationPopover({
  annotation,
  popoverRef,
  x,
  y
}: {
  annotation: Annotation;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  x: number;
  y: number;
}) {
  return (
    <div
      ref={popoverRef}
      className="phrase-tooltip"
      role="tooltip"
      style={{
        left: x,
        top: y
      }}
    >
      <strong>{annotation.phrase}</strong>
      <span>{annotation.meaning}</span>
      <small>{annotation.note}</small>
    </div>
  );
}

type AnnotatedSegment = {
  text: string;
  annotation?: Annotation;
};

function buildAnnotatedSegments(content: string, annotations: Annotation[]): AnnotatedSegment[] {
  const usableAnnotations = annotations.filter((annotation) => annotation.phrase.trim().length > 0);
  if (usableAnnotations.length === 0) {
    return [{ text: content }];
  }

  const segments: AnnotatedSegment[] = [];
  const lowerContent = content.toLocaleLowerCase();
  let index = 0;

  while (index < content.length) {
    let bestMatch: { start: number; annotation: Annotation } | null = null;

    for (const annotation of usableAnnotations) {
      const phrase = annotation.phrase.trim();
      const start = lowerContent.indexOf(phrase.toLocaleLowerCase(), index);

      if (start < 0) {
        continue;
      }

      if (
        !bestMatch ||
        start < bestMatch.start ||
        (start === bestMatch.start && phrase.length > bestMatch.annotation.phrase.trim().length)
      ) {
        bestMatch = { start, annotation };
      }
    }

    if (!bestMatch) {
      segments.push({ text: content.slice(index) });
      break;
    }

    const phrase = bestMatch.annotation.phrase.trim();
    if (bestMatch.start > index) {
      segments.push({ text: content.slice(index, bestMatch.start) });
    }

    segments.push({
      text: content.slice(bestMatch.start, bestMatch.start + phrase.length),
      annotation: bestMatch.annotation
    });
    index = bestMatch.start + phrase.length;
  }

  return segments.filter((segment) => segment.text.length > 0);
}

function speechLanguageCode(language: LanguageCode) {
  const codes: Record<LanguageCode, string> = {
    ja: "ja-JP",
    en: "en-US",
    ko: "ko-KR",
    "zh-Hans": "zh-CN",
    "zh-Hant": "zh-TW",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE"
  };

  return codes[language];
}

function SettingsPanel({
  open,
  profile,
  providerStatus,
  user,
  authActionLoading,
  t,
  onClose,
  onProfileChange,
  onGoogleSignIn,
  onSignOut
}: {
  open: boolean;
  profile: Profile;
  providerStatus: ProviderStatus;
  user: ReturnType<typeof useAuth>["user"];
  authActionLoading: boolean;
  t: UiText;
  onClose: () => void;
  onProfileChange: (profile: Profile) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  return (
    <aside className={`settings-panel ${open ? "is-open" : ""}`}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">{t.settings}</p>
          <h3>{t.learningAndAi}</h3>
        </div>
        <button className="icon-button" type="button" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="settings-section">
        <p className="section-title">{t.accountSection}</p>
        <div className="account-card">
          <UserCircle size={28} />
          <div>
            <strong>{user?.isAnonymous ? t.guestAccount : user?.displayName || t.googleAccount}</strong>
            <span>{user?.isAnonymous ? t.googleHint : user?.email}</span>
          </div>
        </div>
        {user?.isAnonymous ? (
          <button className="secondary-button full" type="button" onClick={onGoogleSignIn} disabled={authActionLoading}>
            <LogIn size={16} />
            {t.continueWithGoogle}
          </button>
        ) : (
          <button className="secondary-button full" type="button" onClick={onSignOut} disabled={authActionLoading}>
            <LogOut size={16} />
            {t.signOut}
          </button>
        )}
      </div>

      <div className="settings-section">
        <p className="section-title">{t.languagesSection}</p>
        <SelectField
          label={t.native}
          value={profile.nativeLanguage}
          onChange={(value) => onProfileChange({ ...profile, nativeLanguage: value })}
        />
        <SelectField
          label={t.practice}
          value={profile.targetLanguage}
          onChange={(value) => onProfileChange({ ...profile, targetLanguage: value })}
        />
        <SelectField
          label={t.uiLanguage}
          value={profile.uiLanguage}
          onChange={(value) => onProfileChange({ ...profile, uiLanguage: value })}
        />
      </div>

      <div className="settings-section">
        <p className="section-title">{t.theme}</p>
        <div className="segmented">
          <button
            type="button"
            className={profile.theme === "light" ? "is-active" : ""}
            onClick={() => onProfileChange({ ...profile, theme: "light" })}
          >
            <Sun size={16} />
            {t.light}
          </button>
          <button
            type="button"
            className={profile.theme === "dark" ? "is-active" : ""}
            onClick={() => onProfileChange({ ...profile, theme: "dark" })}
          >
            <Moon size={16} />
            {t.dark}
          </button>
          <button
            type="button"
            className={profile.theme === "system" ? "is-active" : ""}
            onClick={() => onProfileChange({ ...profile, theme: "system" })}
          >
            {t.system}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <p className="section-title">{t.audioSection}</p>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={profile.autoPlayAssistantAudio}
            onChange={(event) =>
              onProfileChange({ ...profile, autoPlayAssistantAudio: event.target.checked })
            }
          />
          <span>
            <strong>{t.autoPlayAssistantAudio}</strong>
            <small>{t.autoPlayAssistantAudioHint}</small>
          </span>
        </label>
      </div>

      <div className="settings-section">
        <p className="section-title">{t.supportSection}</p>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={profile.preloadAnnotations}
            onChange={(event) =>
              onProfileChange({ ...profile, preloadAnnotations: event.target.checked })
            }
          />
          <span>
            <strong>{t.preloadAnnotations}</strong>
            <small>{t.preloadAnnotationsHint}</small>
          </span>
        </label>
      </div>

      <div className="settings-section">
        <p className="section-title">{t.aiProvider}</p>
        <div className="segmented">
          <button
            type="button"
            className={profile.aiProvider === "gemini" ? "is-active" : ""}
            onClick={() => onProfileChange({ ...profile, aiProvider: "gemini" })}
          >
            Gemini
          </button>
          <button
            type="button"
            className={profile.aiProvider === "openai" ? "is-active" : ""}
            onClick={() => onProfileChange({ ...profile, aiProvider: "openai" })}
            disabled={!providerStatus.openaiAvailable || !providerStatus.openaiAllowed}
          >
            OpenAI
          </button>
        </div>
      </div>
    </aside>
  );
}

function SelectField({
  label,
  value,
  onChange
}: {
  label: string;
  value: Profile["nativeLanguage"];
  onChange: (value: Profile["nativeLanguage"]) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as Profile["nativeLanguage"])}>
        {languages.map((language) => (
          <option value={language} key={language}>
            {languageNames[language]}
          </option>
        ))}
      </select>
    </label>
  );
}

function ShellState({ title, message }: { title: string; message: string }) {
  return (
    <div className="shell-state">
      <Bot size={32} />
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return fallback;
}
