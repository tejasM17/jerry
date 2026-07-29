# AGENTS.md — Jerry (Frontend)

## Quick Start

```sh
npm install
npm run dev          # http://localhost:5173
```

## Tech Stack

- **Framework**: React 19 (Vite 7, ESM)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4 (dark theme, zinc palette, accent `#7c5cfc`)
- **Auth**: Firebase (Auth + Firestore)
- **AI**: Gemini API via backend
- **Animations**: Framer Motion
- **Icons**: react-icons
- **Markdown**: react-markdown + rehype-highlight + remark-gfm

## Setup

1. Copy `.env.example` to `.env.development`
2. Add `VITE_API_BASE_URL=http://localhost:5000/api`
3. Add Firebase config (`VITE_FIREBASE_*`)
4. Run `npm run dev`

## Architecture

```
src/
  main.jsx            → entry (AuthProvider → RouterProvider)
  app/router.jsx      → routes: /, /login, /register
  api/base.js         → API_BASE config
  firebase/           → Firebase init, auth + db exports
  features/
    auth/             → AuthProvider + useAuth hook
    chat/             → ChatPage, ChatWindow, ChatInput, Sidebar, MessageBubble
      useChat.js      → streaming, CRUD, state
  pages/              → Login.jsx, Register.jsx
```

## Key Patterns

- API calls: use `API_BASE` from `src/api/base.js`, include `Authorization: Bearer <firebase-id-token>`
- Streaming: SSE via `response.body.getReader()`, `role: "streaming"` is intermediate
- File uploads: POST FormData to `/api/chat/upload`, profile photos via Cloudinary
