# AGENTS.md — Jerry (ai-frontend)

## Project

React 19 SPA (Vite 7, ESM) — AI chat interface frontend. Backend is separate repo: `github.com/tejasM17/jerry-api`.

## Commands

```sh
npm install          # install deps
npm run dev          # vite dev server (http://localhost:5173)
npm run build        # production build to dist/
npm run lint         # eslint flat config (js/jsx)
npm run preview      # preview prod build locally
```

No test runner is configured. No CI pipelines exist.

## Environment

- `.env.development` — active config (contains real Firebase keys, do not commit)
- `.env.example` — template for new setups
- Required vars: `VITE_API_BASE_URL`, Firebase config (`VITE_FIREBASE_*`)
- API default: `http://localhost:5000/api` — backend must be running for chat to work

## Architecture

```
src/
  main.jsx            → ReactDOM entry (AuthProvider → RouterProvider)
  app/router.jsx      → React Router v7 (/, /login, /register)
  api/base.js         → API_BASE = import.meta.env.VITE_API_BASE_URL
  firebase/           → Firebase init, exports auth + Firestore db
  features/
    auth/             → AuthProvider context + useAuth hook
    chat/             → ChatPage, ChatWindow, ChatInput, Sidebar, MessageBubble
      useChat.js      → core chat hook: streaming, CRUD, state
  pages/              → Login.jsx, Register.jsx
```

## Key Conventions

- **API calls**: Always use `API_BASE` from `src/api/base.js`. Include `Authorization: Bearer <firebase-id-token>` header on every request.
- **Streaming**: Chat responses use SSE via `response.body.getReader()`. A message with `role: "streaming"` is intermediate — final messages use `role: "assistant"`.
- **Chat IDs**: New chats return `X-Chat-Id` response header. Existing chats use `activeChatId` for continue/edit/delete endpoints.
- **Styling**: Tailwind CSS 4 only, no inline styles. Dark-only theme using zinc palette. Accent: `#7c5cfc`. CSS custom properties in `src/index.css` define all theme tokens.
- **Tailwind CSS 4**: Uses `@import "tailwindcss"` syntax (not `@tailwind` directives). Config via `@tailwindcss/vite` plugin.
- **File uploads**: FormData POST to `/api/chat/upload`. Profile photos use Cloudinary (unsigned preset `jerry_unsigned`).
- **Components**: Small and focused. Logic extracted into custom hooks (e.g., `useChat.js`).
- **Animations**: framer-motion throughout. Keep transitions smooth and consistent.
- **Icons**: react-icons library.

## Testing

No test framework is installed. If adding tests, prefer vitest (already in the Vite ecosystem). The `GEMINI.md` notes tests should be added when modifying core logic.

## Related Files

- `GEMINI.md` — additional architectural mandates for AI agents
- `opencode.json` — MCP servers (filesystem, websearch, tailwind)
