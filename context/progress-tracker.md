# Progress Tracker

## Phase

- **Firebase removed** from SPA (no `firebase` package, no `src/firebase`).
- Chat UI talks only to jerry-api via `src/api/chat.js` + `useChat`.
- Clerk auth unchanged (`AuthProvider` → Bearer JWT).
- **Session URLs** — `/` empty composer; `/c/:sessionId` conversation; optional `?rid=` turn id (Grok-style).
- **Edit-message flow** — `useChat.sendMessage` pins the server-issued `X-User-Message-Id` onto the optimistic user message so the in-place edit (hover → pencil → textarea → Send) can address the message by real id; `useChat` now returns `editMessage` (previously missing, so the Send click was a no-op).
- **Borders** — every `border-[#000000]` / `ring-[#000000]` replaced with `border-white/10` / `ring-white/10`; `--border-subtle` and `--border-default` in `index.css` now point at `rgba(255,255,255,0.06)` / `rgba(255,255,255,0.1)` per `ui-context.md` so dividers, modal outlines, table grids, and code-block edges render as subtle white hairlines on the black canvas.
- **Dev-only Clerk warning suppressed** via `src/features/auth/suppressClerkDevWarning.js`. Production builds are untouched.
- **Message action toolbar (`MessageActions`)** — Copy + Edit icons now hidden by default (`opacity-0`) and only revealed on hover of the parent user message bubble (`group-hover:opacity-100`). Removed the `visible` prop; the ternary that previously forced `opacity-100` regardless of hover state is gone.

## Done this migration

| Area | Location |
| --- | --- |
| Chat API client | `src/api/chat.js` — session headers, `createChatSession` |
| useChat | URL sync via `useParams` / `navigate` to `/c/:sessionId` |
| Router | `/`, `/c/:sessionId`, legacy `/chat/:sessionId` |
| Env | Clerk + `VITE_API_BASE_URL` only |
| Deploy docs | `docs/DEPLOYMENT.md` (Vercel/Netlify SPA + Render API) |

## Open

- Valid Gemini `API_KEY` required for streaming (invalid key → stream error text).
- Backend Atlas Mongo must stay connected for session persistence.
