# AGENTS.md — Jerry (Frontend)

## Quick Start

```sh
npm install
npm run dev          # http://localhost:5173
```

## Tech Stack

- **Framework**: React 19 (Vite 7, ESM)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4 (dark theme)
- **Auth**: Clerk (`@clerk/clerk-react`)
- **API**: jerry-api (Mongo chats/messages/files + Gemini stream)
- **Animations**: Framer Motion
- **Icons**: react-icons
- **Markdown**: react-markdown + rehype-highlight + remark-gfm

## Setup

1. Copy `.env.example` to `.env.development`
2. Set:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
3. Run `npm run dev` (API must be on :5000)

## Architecture

```
src/
  main.jsx              → ClerkProvider → AuthProvider → Router
  app/router.jsx        → /, /sign-in, /sign-up, profile routes
  api/base.js           → API_BASE
  api/chat.js           → chat CRUD + stream helpers
  api/profile.js        → profile API
  features/
    auth/               → AuthProvider (syncs Mongo user on login)
    chat/               → ChatPage, useChat, Sidebar, ChatInput…
    profile/
```

## Key Patterns

- API: `Authorization: Bearer ${await user.getIdToken()}` (Clerk session JWT)
- Streaming: `readTextStream` / `role: "streaming"` intermediate bubble
- Uploads: `uploadChatFile` → GridFS via `/api/chat/upload`
- No Firebase client SDK
