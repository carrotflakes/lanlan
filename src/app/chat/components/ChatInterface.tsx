"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
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
  const { nativeLanguage, learningLanguage } = useLanguage();
  const { currentSession, updateCurrentSessionMessages } = useChatSession();
  const { t } = useClientTranslations();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const messages = currentSession ? currentSession.messages : [];

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
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-3 sm:space-y-4 px-4">
              <div className="text-4xl sm:text-6xl">💬</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
                {t("chat.startConversation")}
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
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
          <div className="flex justify-start mb-4">
            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gray-100">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {t("chat.aiThinking")}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            className="flex-grow px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-medium transition-all duration-200 ${
              loading || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
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
  "flex items-center space-x-1 text-xs px-2 sm:px-3 py-1 rounded-full transition-colors duration-200";
const TRANSLATE_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-blue-50 hover:bg-blue-100 text-blue-600`;
const SPEAK_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-green-50 hover:bg-green-100 text-green-600`;
const ANNOTATE_BUTTON_CLASSES = `${BUTTON_BASE_CLASSES} bg-yellow-50 hover:bg-yellow-100 text-yellow-600`;

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
    } mb-3 sm:mb-4`}
  >
    <div
      className={`max-w-[85%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
        msg.role === "user"
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      }`}
    >
      <div className="flex items-center mb-1 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium opacity-80">
          {msg.role === "user"
            ? `👤 ${t("chat.you")}`
            : `🤖 ${t("chat.aiAssistant")}`}
        </span>
      </div>
      <div className="text-sm sm:text-base leading-relaxed">
        {msg.role === "model" ? (
          <AIText text={msg.parts} annotations={msg.annotations} />
        ) : (
          <p>{msg.parts}</p>
        )}
      </div>
      {msg.role === "model" && (
        <div className="flex items-center justify-start mt-2 sm:mt-3 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
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
        <div className="mt-3 p-3 bg-white/80 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            🌍 {t("chat.translation")}:
          </p>
          <p className="text-sm text-gray-700">{msg.translatedText}</p>
        </div>
      )}
      {msg.showAnnotations && msg.annotations && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs font-medium text-yellow-700 mb-2">
            💡 {t("chat.annotations")}:
          </p>
          <div className="space-y-2">
            {msg.annotations.map(
              (
                annotation: { word: string; explanation: string },
                idx: number
              ) => (
                <div key={idx} className="text-sm">
                  <span className="font-semibold text-yellow-800">
                    {annotation.word}
                  </span>
                  <span className="text-yellow-700 ml-2">
                    - {annotation.explanation}
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

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        ) : (
          <span
            key={index}
            className="underline decoration-yellow-500 decoration-2 decoration-dotted cursor-help relative group"
          >
            {part.word}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="max-w-xl break-keep">{part.explanation}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </span>
        )
      )}
    </div>
  );
}
