import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { UILanguageProvider } from "@/context/UILanguageContext";
import SessionSidebar from "@/components/SessionSidebar";
import Header from "@/components/Header";

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
        <UILanguageProvider>
          <LanguageProvider>
            <ChatSessionProvider>
              <div className="flex h-screen">
                <SessionSidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 overflow-hidden p-3">
                    {children}
                  </main>
                </div>
              </div>
            </ChatSessionProvider>
          </LanguageProvider>
        </UILanguageProvider>
      </body>
    </html>
  );
}

