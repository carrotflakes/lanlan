"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useChatSession, type Message } from "@/context/ChatSessionContext";
import { FaLanguage, FaVolumeUp } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const { nativeLanguage, learningLanguage } = useLanguage();
  const { currentSession, updateCurrentSessionMessages } = useChatSession();
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
        headers: {
          "Content-Type": "application/json",
        },
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
        { role: "model", parts: "An error occurred. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (index: number, textToTranslate: string) => {
    if (!currentSession) return;

    const updatedMessages = [...currentSession.messages];
    if (
      updatedMessages[index].translatedText &&
      updatedMessages[index].showTranslation
    ) {
      // If already translated and shown, just hide it
      updatedMessages[index].showTranslation = false;
      updateCurrentSessionMessages(updatedMessages);
      return;
    }

    if (
      updatedMessages[index].translatedText &&
      !updatedMessages[index].showTranslation
    ) {
      // If already translated but hidden, just show it
      updatedMessages[index].showTranslation = true;
      updateCurrentSessionMessages(updatedMessages);
      return;
    }

    // If not translated yet, fetch translation
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      updatedMessages[index].translatedText = "Translation failed.";
      updatedMessages[index].showTranslation = true;
      updateCurrentSessionMessages(updatedMessages);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Map common language names to BCP 47 language tags
      const langMap: { [key: string]: string } = {
        English: "en-US",
        Japanese: "ja-JP",
        Spanish: "es-ES",
        French: "fr-FR",
        German: "de-DE",
        Chinese: "zh-CN",
        Korean: "ko-KR",
      };
      utterance.lang = langMap[lang] || "en-US"; // Default to en-US if not found
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in your browser.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4">
              <div className="text-6xl">💬</div>
              <h3 className="text-xl font-semibold text-gray-700">
                Start Your Conversation
              </h3>
              <p className="text-gray-500">
                Type a message below to begin practicing your target language
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium opacity-80">
                    {msg.role === "user" ? "👤 You" : "🤖 AI Assistant"}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">
                  {msg.role === "model" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
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
                  <div className="flex items-center justify-start mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button
                        className="flex items-center space-x-1 text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors duration-200"
                        onClick={() => handleTranslate(index, msg.parts)}
                        title={
                          msg.showTranslation && msg.translatedText
                            ? "Hide Translation"
                            : "Show Translation"
                        }
                      >
                        <FaLanguage size={12} />
                        <span>
                          {msg.showTranslation && msg.translatedText
                            ? "Hide"
                            : "Translate"}
                        </span>
                      </button>
                      <button
                        className="flex items-center space-x-1 text-xs px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-full transition-colors duration-200"
                        onClick={() => handleSpeak(msg.parts, learningLanguage)}
                        title="Play Audio"
                      >
                        <FaVolumeUp size={12} />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>
                )}
                {msg.showTranslation && msg.translatedText && (
                  <div className="mt-3 p-3 bg-white/80 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      🌍 Translation:
                    </p>
                    <p className="text-sm text-gray-700">
                      {msg.translatedText}
                    </p>
                  </div>
                )}
              </div>
            </div>
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
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            className="flex-grow px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            placeholder="Type your message in your target language..."
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
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              loading || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
            }`}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
