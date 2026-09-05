# Architecture Context

## Stack

| Layer      | Technology                                 | Role |
|------------|--------------------------------------------|------|
| Framework  | React (JSX) + Vite                         | Front‑end application bundler & dev server |
| UI         | Tailwind CSS + custom JSX components       | Styling & component library |
| Auth       | Firebase Auth (`firebase`)                 | Sign-in, ID token, OAuth + credentials |
| API        | jerry-api (`VITE_API_BASE_URL`)            | Chats, messages, profile, uploads, Gemini stream |
| Data       | MongoDB via backend only                   | No client DB SDK |

## System Boundaries

- `src/app` – routing (React Router).
- `src/features/*` – auth, chat, profile UI + hooks.
- `src/api` – `base.js`, `chat.js`, `profile.js` HTTP clients.
- `src/assets` – static assets.

## Storage Model

- All chat sessions, messages, and files go through **jerry-api** (Mongo + GridFS).
- No Firebase / Firestore on the client.

## Auth and Access Model

- `ClerkProvider` + `AuthProvider` bridge: `user.getIdToken()` → Clerk session JWT.
- Protected routes: `ProtectedRoute`.
- API: `Authorization: Bearer <JWT>`.

## Invariants

1. `ClerkProvider` wraps the tree; `AuthProvider` under it for chat hooks.
2. Do not trust `isSignedIn` until Clerk `isLoaded`.
3. Chat I/O only via `src/api/chat.js` / hooks — not direct DB.
