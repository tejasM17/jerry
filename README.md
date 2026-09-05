# Jerry - AI Chat Interface

Jerry is a modern, responsive AI chat application built with React, Vite, Tailwind CSS, and **Firebase Auth**.

## Features

- **Firebase auth**: Google, GitHub, and email + password
- **Protected routes** for chat and profile
- **Real-time streaming** AI responses
- **Markdown** with code highlighting
- **Mobile-first** sidebar layout

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Auth (`firebase`) |
| Routing | React Router 7 |
| Toasts | sonner |
| Icons | lucide-react, react-icons |

---

## Getting Started

### 1. Environment

Copy `.env.example` to `.env.development` and set `VITE_API_BASE_URL` plus the `VITE_FIREBASE_*` keys. Production (Vercel) is documented in `PRODUCTION.md`.

### 2. Firebase Console

1. Enable Email/Password, Google, and GitHub in Authentication → Sign-in method
2. Add `localhost` and your Vercel host under Authentication → Settings → Authorized domains

### 3. Install & run

```bash
npm install
npm run dev
```

App: `http://localhost:5173`  
Sign-in: `/sign-in` · Sign-up: `/sign-up` · Profile shell: `/profile`  
Legacy `/login` and `/register` redirect to Clerk paths.

### 4. Backend

API must verify Firebase ID tokens (`Authorization: Bearer`). See `jerry-api` README / env (`FIREBASE_*`, `FRONTEND_URL`).

---

## Auth architecture (frontend)

- `FirebaseAuthProvider` in `src/main.jsx`
- `ProtectedRoute` / `PublicOnlyRoute` in `src/features/auth/ProtectedRoute.jsx`
- `AuthProvider` bridges Firebase → `{ user, getIdToken() }` and POSTs `/api/auth/sync`
- After sign-in/up, redirect to `/` (chat). Profile at `/profile`

## Keyboard shortcuts

- **Enter**: Send message  
- **Shift + Enter**: New line  

---

*Jerry can make mistakes. Verify important information.*
