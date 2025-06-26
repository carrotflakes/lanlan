import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";
import SessionSidebar from "@/components/SessionSidebar";
import Link from "next/link";

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
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Link 
                      href="/" 
                      className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>🌏 LanLan</span>
                    </Link>
                    <div className="text-xs text-gray-600">
                      Language Learning Platform
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-hidden p-3">
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

