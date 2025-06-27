"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useChatSession, type Message } from "@/context/ChatSessionContext";
import { useClientTranslations } from "@/hooks/useClientTranslations";
import { FaLanguage, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

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

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;

    const userMessage: Message = { role: "user", parts: input };
    const updatedMessages = [...messages, userMessage];
    updateCurrentSessionMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.map((msg) => ({
            role: msg.role,
            parts: msg.parts,
          })),
          nativeLanguage,
          learningLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: Message = { role: "model", parts: data.response };
      updateCurrentSessionMessages([...updatedMessages, modelMessage]);
      handleSpeak(data.response, learningLanguage); // Automatically play audio
    } catch (error) {
      console.error("Error sending message:", error);
      updateCurrentSessionMessages([
        ...updatedMessages,
        { role: "model", parts: t("chat.errorOccurred") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (index: number, textToTranslate: string) => {
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages];
    const message = updatedMessages[index];

    // Toggle translation visibility if already translated
    if (message.translatedText) {
      message.showTranslation = !message.showTranslation;
      updateCurrentSessionMessages(updatedMessages);
      return;
    }

    // Fetch translation if not available
    await fetchTranslation(index, textToTranslate, updatedMessages);
  };

  const fetchTranslation = async (
    index: number,
    textToTranslate: string,
    updatedMessages: Message[]
  ) => {
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLanguage: learningLanguage,
          targetLanguage: nativeLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      updatedMessages[index].translatedText = data.translatedText;
      updatedMessages[index].showTranslation = true;
      updateCurrentSessionMessages(updatedMessages);
    } catch (error) {
      console.error("Error translating text:", error);
      updatedMessages[index].translatedText = t("chat.translationFailed");
      updatedMessages[index].showTranslation = true;
      updateCurrentSessionMessages(updatedMessages);
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
  onSpeak,
  learningLanguage,
  t,
}: {
  msg: Message;
  index: number;
  onTranslate: (index: number, text: string) => void;
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
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
            }}
          >
            {msg.parts}
          </ReactMarkdown>
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
    </div>
  </div>
);
