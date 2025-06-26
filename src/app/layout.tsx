import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";
import SessionSidebar from "@/components/SessionSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Language Learning App",
  description: "An app to learn languages with flashcards and AI chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100`}
      >
        <LanguageProvider>
          <ChatSessionProvider>
            <div className="flex h-screen">
              <SessionSidebar />
              <div className="flex-1 flex flex-col">
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-sm">
                  <h1 className="text-2xl font-bold text-gray-800 text-center">
                    🌏 LanLan - Language Learning
                  </h1>
                </header>
                <main className="flex-1 overflow-hidden p-6">
                  {children}
                </main>
              </div>
            </div>
          </ChatSessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

