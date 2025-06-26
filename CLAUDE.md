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
- **Context-based State Management**: Two main contexts manage global state:
  - `LanguageContext` - Manages native and learning language preferences with localStorage persistence
  - `ChatSessionContext` - Handles multiple chat sessions with UUID-based identification and localStorage persistence

### Key Components
- **Layout System**: Root layout includes both context providers and a persistent sidebar
- **Chat Interface**: Main interactive component with markdown rendering, translation, and TTS features
- **Session Management**: Multi-session chat functionality with session creation, loading, and deletion

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
- Tailwind CSS for styling
- React Icons for UI elements
- React Markdown for rendering AI responses
- Web Speech API integration for text-to-speech functionality

### TypeScript Integration
- Strict typing throughout with proper interface definitions
- Custom types for Message and ChatSession structures
- Context type safety with proper error handling for provider usage