"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useChatSession, type Message } from "@/context/ChatSessionContext";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { FaLanguage, FaVolumeUp, FaLightbulb } from "react-icons/fa";
import { apiService } from "@/services/api";

// Language mapping for speech synthesis
const LANGUAGE_MAP: { [key: string]: string } = {
  English: "en-US",
  Japanese: "ja-JP",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Chinese: "zh-CN",
  Korean: "ko-KR",
};

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const { currentSession, updateCurrentSessionMessages } = useChatSession();
  const { t } = useClientTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const messages = currentSession ? currentSession.messages : [];
  const nativeLanguage = currentSession?.nativeLanguage || 'English';
  const learningLanguage = currentSession?.learningLanguage || 'Japanese';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Message update utilities for immutable state management
  const addMessage = (message: Message) => {
    if (!currentSession) return null;
    const updatedMessages = [...messages, message];
    updateCurrentSessionMessages(updatedMessages);
    return updatedMessages;
  };

  const updateMessage = (
    index: number,
    updates: Partial<Message>,
    currentMessages: Message[] = messages
  ) => {
    if (!currentSession || index < 0 || index >= currentMessages.length)
      return currentMessages;
    const updatedMessages = currentMessages.map((msg, i) =>
      i === index ? { ...msg, ...updates } : msg
    );
    updateCurrentSessionMessages(updatedMessages);
    return updatedMessages;
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;

    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      // Add user message
      const userMessage: Message = { role: "user", parts: userInput };
      const messagesWithUser = addMessage(userMessage);
      if (!messagesWithUser) throw new Error("Failed to add user message");

      // Send to AI
      const data = await apiService.chat.sendMessage({
        message: userInput,
        history: messages.map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        nativeLanguage,
        learningLanguage,
      });

      // Add AI message
      const modelMessage: Message = { role: "model", parts: data.response };
      const messagesWithModel = [...messagesWithUser, modelMessage];
      updateCurrentSessionMessages(messagesWithModel);

      handleSpeak(data.response, learningLanguage);

      // Fetch annotations asynchronously
      const modelMessageIndex = messagesWithModel.length - 1;
      fetchAnnotationsForMessage(
        modelMessageIndex,
        data.response,
        false,
        messagesWithModel
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage: Message = {
        role: "model",
        parts: apiService.handleApiError(error, t("chat.errorOccurred")),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (index: number, textToTranslate: string) => {
    if (!currentSession) return;

    const message = messages[index];

    // Toggle translation visibility if already translated
    if (message.translatedText) {
      updateMessage(index, { showTranslation: !message.showTranslation });
      return;
    }

    // Fetch translation if not available
    await fetchTranslationForMessage(index, textToTranslate);
  };

  const fetchTranslationForMessage = async (
    index: number,
    textToTranslate: string
  ) => {
    try {
      const data = await apiService.translation.translateText({
        text: textToTranslate,
        sourceLanguage: learningLanguage,
        targetLanguage: nativeLanguage,
      });

      updateMessage(index, {
        translatedText: data.translatedText,
        showTranslation: true,
      });
    } catch (error) {
      console.error("Error translating text:", error);
      updateMessage(index, {
        translatedText: apiService.handleApiError(
          error,
          t("chat.translationFailed")
        ),
        showTranslation: true,
      });
    }
  };

  const handleAnnotate = async (index: number, textToAnnotate: string) => {
    if (!currentSession) return;

    const message = messages[index];

    // Toggle annotation visibility if already annotated
    if (message.annotations) {
      updateMessage(index, { showAnnotations: !message.showAnnotations });
      return;
    }

    // Fetch annotations if not available
    await fetchAnnotationsForMessage(index, textToAnnotate, true, messages);
  };

  const fetchAnnotationsForMessage = async (
    index: number,
    textToAnnotate: string,
    showAnnotations: boolean,
    currentMessages: Message[] = messages
  ) => {
    try {
      const data = await apiService.annotation.getAnnotations({
        text: textToAnnotate,
        language: learningLanguage,
        explanationLanguage: nativeLanguage,
      });

      updateMessage(
        index,
        {
          annotations: data.annotations,
          showAnnotations: showAnnotations,
        },
        currentMessages
      );
    } catch (error) {
      console.error("Error fetching annotations:", error);
      updateMessage(
        index,
        {
          annotations: [],
          showAnnotations: false,
        },
        currentMessages
      );
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_MAP[lang] || "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      alert(t("chat.ttsNotSupported"));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 px-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                {t("chat.startConversation")}
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {t("chat.typeMessage")}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={index}
              msg={msg}
              index={index}
              onTranslate={handleTranslate}
              onAnnotate={handleAnnotate}
              onSpeak={handleSpeak}
              learningLanguage={learningLanguage}
              t={t}
            />
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                </div>
                <span className="text-xs text-slate-500">{t("chat.aiThinking")}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder={t("chat.inputPlaceholder")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                sendMessage();
              }
            }}
            disabled={loading}
          />
          <button
            className={`px-5 py-2.5 text-sm rounded-xl font-medium ${
              loading || !input.trim()
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30"
            }`}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Common CSS classes
const BUTTON_BASE_CLASSES =
  "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full";
const TRANSLATE_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-violet-50 hover:bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:hover:bg-violet-950/50 dark:text-violet-400`;
const SPEAK_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:text-emerald-400`;
const ANNOTATE_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:text-amber-400`;

// Message Action Button Component
const MessageActionButton = ({
  onClick,
  icon,
  text,
  className,
  title,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  className: string;
  title: string;
}) => (
  <button className={className} onClick={onClick} title={title}>
    {icon}
    <span>{text}</span>
  </button>
);

// Individual Message Component
const MessageBubble = ({
  msg,
  index,
  onTranslate,
  onAnnotate,
  onSpeak,
  learningLanguage,
  t,
}: {
  msg: Message;
  index: number;
  onTranslate: (index: number, text: string) => void;
  onAnnotate: (index: number, text: string) => void;
  onSpeak: (text: string, lang: string) => void;
  learningLanguage: string;
  t: (key: string) => string;
}) => (
  <div
    className={`flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div
      className={`max-w-[85%] sm:max-w-[78%] px-4 py-3 ${
        msg.role === "user"
          ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm"
      }`}
    >
      <div className="text-sm leading-relaxed">
        {msg.role === "model" ? (
          <AIText text={msg.parts} annotations={msg.annotations} />
        ) : (
          <p>{msg.parts}</p>
        )}
      </div>
      {msg.role === "model" && (
        <div className="flex items-center justify-start mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MessageActionButton
              onClick={() => onTranslate(index, msg.parts)}
              icon={<FaLanguage size={12} />}
              text={
                msg.showTranslation && msg.translatedText
                  ? t("chat.hide")
                  : t("chat.translate")
              }
              className={TRANSLATE_BUTTON_CLASSES}
              title={
                msg.showTranslation && msg.translatedText
                  ? "Hide Translation"
                  : "Show Translation"
              }
            />
            <MessageActionButton
              onClick={() => onAnnotate(index, msg.parts)}
              icon={<FaLightbulb size={12} />}
              text={
                msg.showAnnotations && msg.annotations
                  ? t("chat.hide")
                  : t("chat.annotate")
              }
              className={ANNOTATE_BUTTON_CLASSES}
              title={
                msg.showAnnotations && msg.annotations
                  ? "Hide Annotations"
                  : "Show Annotations"
              }
            />
            <MessageActionButton
              onClick={() => onSpeak(msg.parts, learningLanguage)}
              icon={<FaVolumeUp size={12} />}
              text={t("chat.listen")}
              className={SPEAK_BUTTON_CLASSES}
              title="Play Audio"
            />
          </div>
        </div>
      )}
      {msg.showTranslation && msg.translatedText && (
        <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-violet-500 dark:text-violet-400 mb-1.5 uppercase tracking-wide">
            {t("chat.translation")}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{msg.translatedText}</p>
        </div>
      )}
      {msg.showAnnotations && msg.annotations && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
            {t("chat.annotations")}
          </p>
          <div className="space-y-1.5">
            {msg.annotations.map(
              (
                annotation: { word: string; explanation: string },
                idx: number
              ) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {annotation.word}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">
                    — {annotation.explanation}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

function AIText({
  text,
  annotations,
}: {
  text: string;
  annotations?: { word: string; explanation: string }[];
}) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const parts: (string | { word: string; explanation: string })[] =
    useMemo(() => {
      if (!annotations) return [text];

      const parts = [];
      let lastIndex = 0;
      while (lastIndex < text.length) {
        let ann: { word: string; explanation: string } | undefined;
        let annIndex = text.length;
        for (const annotation of annotations) {
          const findIndex = text.indexOf(annotation.word, lastIndex);
          if (findIndex !== -1 && findIndex < annIndex) {
            annIndex = findIndex;
            ann = annotation;
          }
        }
        if (ann) {
          parts.push(text.slice(lastIndex, annIndex));
          parts.push(ann);
          lastIndex = annIndex + ann.word.length;
        } else {
          parts.push(text.slice(lastIndex));
          break;
        }
      }
      return parts;
    }, [text, annotations]);

  const handleTooltipToggle = (index: number) => {
    setActiveTooltip(activeTooltip === index ? null : index);
  };

  return (
    <div className="text-slate-800 dark:text-slate-200">
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        ) : (
          <span
            key={index}
            className="underline decoration-amber-400 decoration-2 decoration-dotted cursor-help relative"
            onClick={() => handleTooltipToggle(index)}
          >
            {part.word}
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl z-10 w-max max-w-xs ${
              activeTooltip === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="break-words">{part.explanation}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
            </div>
          </span>
        )
      )}
    </div>
  );
}
