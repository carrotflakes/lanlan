# LanLan Firebase MVP

LanLan is a React + Firebase language practice app. It uses Firebase Auth, Firestore sessions/messages, callable Firebase Functions for AI calls, Gemini as the default provider, and an app-level OpenAI key that can be enabled per user.

## Local Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill `.env.local` with the Firebase web app config.

4. Start the web app:

   ```bash
   pnpm dev
   ```

## Firebase Setup

- Enable Firebase Auth providers:
  - Anonymous sign-in.
  - Google sign-in.
- Enable Firestore.
- Enable Cloud Functions.
- Configure the Functions secret and params:
  - `GEMINI_API_KEY`: Firebase Functions secret.
  - `OPENAI_API_KEY`: optional Firebase Functions secret for the app-level OpenAI key.
  - Optional runtime environment values: `GEMINI_MODEL`, `OPENAI_MODEL`.
    - Default Gemini model: `models/gemini-2.5-flash-lite`.
    - If Gemini returns 404, confirm that `GEMINI_MODEL` is not set to an unavailable model such as an old `gemini-1.5-*` value.

Firestore profile data is stored at `users/{uid}/profile/settings` because Firestore documents require an even number of path segments. Sessions and messages follow the user-scoped layout.

The UI language is stored independently from the practice language as `uiLanguage` in the user profile. Users can change it from Settings.
Chinese is split into `zh-Hans` for Simplified Chinese and `zh-Hant` for Traditional Chinese. The old `zh` code is not kept for compatibility.
Assistant audio auto-play is stored as `autoPlayAssistantAudio` in the user profile and can be changed from Settings.

## OpenAI Access

OpenAI uses one app-level key stored as the `OPENAI_API_KEY` Functions secret. Users do not provide or store their own OpenAI API keys.

OpenAI is disabled for each user by default. To allow a user, create or update this Firestore document directly:

```text
users/{uid}/permissions/openai
```

with:

```json
{
  "enabled": true
}
```

The `permissions` collection is denied to all client reads/writes in `firestore.rules`; callable Functions read it with the Admin SDK.

## Commands

```bash
pnpm dev
pnpm test
pnpm build
pnpm --dir functions test
pnpm --dir functions build
```

## Notes

- `permissions` and legacy `apiSecrets` are denied to all client reads/writes in `firestore.rules`.
- AI requests are made only from Firebase Functions, never directly from the browser.
- Google sign-in links the current anonymous account when possible, so sessions created as a guest can continue under the Google account. If the Google account was already used, Firebase signs into that existing account instead.
