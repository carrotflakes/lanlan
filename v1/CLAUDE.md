# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js language learning application called "LanLan" that helps users practice languages through interactive chat with Google's Gemini AI. The app supports conversation practice in a target language with translation features and text-to-speech capabilities.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production  
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

The project uses pnpm as the package manager (evidenced by pnpm-lock.yaml).

## Architecture Overview

### Core Structure
- **Next.js App Router**: Uses the new app directory structure with TypeScript
- **Context-based State Management**: Multiple React contexts manage global state:
  - `LanguageContext` - Manages native and learning language preferences with localStorage persistence
  - `ChatSessionContext` - Handles multiple chat sessions with UUID-based identification and localStorage persistence
  - `UILanguageContext` - Manages UI language (English, Japanese, Spanish, Chinese) with browser locale detection
  - `ThemeContext` - Handles dark/light mode with system preference detection and localStorage persistence  
  - `MobileContext` - Manages responsive sidebar state for mobile devices

### Key Components
- **Layout System**: Root layout includes nested context providers and responsive sidebar with mobile drawer
- **Chat Interface**: Main interactive component with markdown rendering, translation, and TTS features
- **Session Management**: Multi-session chat functionality with session creation, loading, and deletion
- **Responsive Design**: Mobile-first design with drawer sidebar, responsive breakpoints (sm: 640px+, lg: 1024px+)
- **Dark Mode**: Full theme support with Tailwind CSS v4 class-based implementation

### API Integration
- **Google Gemini AI**: Uses `@google/generative-ai` SDK with Gemini 2.5 Flash Lite model
- **Chat API** (`/api/chat/route.ts`): Handles conversational AI with language learning prompts
- **Translation API** (`/api/translate/route.ts`): Provides on-demand translation between languages

### Environment Requirements
- `GEMINI_API_KEY` environment variable required for Google Generative AI access

### Data Persistence
- Chat sessions stored in browser localStorage with automatic session recovery
- Language preferences persisted across browser sessions
- Message history maintained per session with translation cache

### UI Framework  
- **Tailwind CSS v4**: Uses `@tailwind/postcss` with custom dark mode variant (`@custom-variant dark`)
- **Internationalization**: next-intl with message files in `src/i18n/messages/` (en, ja, es, zh)
- **Icons**: React Icons for UI elements
- **Markdown**: React Markdown for rendering AI responses with custom components
- **Speech**: Web Speech API integration for text-to-speech functionality
- **Fonts**: Geist Sans and Geist Mono from next/font/google

### TypeScript Integration
- Strict typing throughout with proper interface definitions
- Custom types for Message and ChatSession structures  
- Context type safety with proper error handling for provider usage
- Custom hooks like `useClientTranslations` for type-safe i18n with `unknown` type handling

## Important Implementation Details

### Dark Mode Configuration
- Tailwind CSS v4 requires `@custom-variant dark (&:where(.dark, .dark *))` in globals.css
- No tailwind.config.js needed for v4
- Theme switching managed by ThemeContext with class-based implementation

### Context Provider Hierarchy
```jsx
<UILanguageProvider>
  <ThemeProvider>
    <MobileProvider>  
      <LanguageProvider>
        <ChatSessionProvider>
          // App components
        </ChatSessionProvider>
      </LanguageProvider>
    </MobileProvider>
  </ThemeProvider>
</UILanguageProvider>
```

### Mobile Responsiveness
- Sidebar transforms to mobile drawer with backdrop overlay
- Responsive breakpoints: sm (640px+), lg (1024px+) 
- Auto-close sidebar on mobile after interactions