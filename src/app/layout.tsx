import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { UILanguageProvider } from "@/context/UILanguageContext";
import { MobileProvider } from "@/context/MobileContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      >
        <UILanguageProvider>
          <ThemeProvider>
            <MobileProvider>
              <ChatSessionProvider>
                <div className="flex h-screen">
                  <SessionSidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-3 sm:p-4">
                      {children}
                    </main>
                  </div>
                </div>
              </ChatSessionProvider>
            </MobileProvider>
          </ThemeProvider>
        </UILanguageProvider>
      </body>
    </html>
  );
}

