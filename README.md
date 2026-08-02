# Jerry - AI Chat Interface

Jerry is a modern, responsive AI chat application built with React, Vite, Tailwind CSS, and **Clerk** authentication.

## Features

- **Clerk auth**: Google OAuth, email + password, username + password, forgot password
- **Protected routes** for chat and profile
- **Real-time streaming** AI responses
- **Markdown** with code highlighting
- **Mobile-first** sidebar layout

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 |
| Auth | Clerk (`@clerk/clerk-react`) |
| Routing | React Router 7 |
| Toasts | sonner |
| Icons | lucide-react, react-icons |

---

## Getting Started

### 1. Environment

Copy `.env.example` to `.env.development` and set:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Publishable key: [Clerk Dashboard](https://dashboard.clerk.com/) → **API Keys**.

### 2. Clerk Dashboard configuration

Configure these so the in-app `<SignIn />` / `<SignUp />` match the product requirements:

1. **Social** — User & authentication → Social connections → enable **Google**
2. **Email + password** — enable Email address and Password
3. **Username** — enable Username as an identifier (sign-in with email *or* username)
4. **Forgot password** — keep password reset enabled (default with Email+Password)
5. **Paths / URLs**
   - Application → Domains / paths: sign-in `/sign-in`, sign-up `/sign-up`
   - Allowed origins: `http://localhost:5173` (and production frontend URL)
   - Redirect URLs: `http://localhost:5173`, `http://localhost:5173/sign-in`, etc.
6. Align **secret key** on the API (`jerry-api` `CLERK_SECRET_KEY`) with the same Clerk application

### 3. Install & run

```bash
npm install
npm run dev
```

App: `http://localhost:5173`  
Sign-in: `/sign-in` · Sign-up: `/sign-up` · Profile shell: `/profile`  
Legacy `/login` and `/register` redirect to Clerk paths.

### 4. Backend

API must verify Clerk session JWTs (`Authorization: Bearer`). See `jerry-api` README / env (`CLERK_SECRET_KEY`, `FRONTEND_URL`).

---

## Auth architecture (frontend)

- `ClerkProvider` in `src/main.jsx` with `VITE_CLERK_PUBLISHABLE_KEY`
- `ProtectedRoute` / `PublicOnlyRoute` in `src/features/auth/ProtectedRoute.jsx`
- `AuthProvider` bridges Clerk → `{ user, getIdToken() }` for chat API calls
- After sign-in/up, redirect to `/` (chat). Profile overview at `/profile` (full edit UI is Step 3)

## Keyboard shortcuts

- **Enter**: Send message  
- **Shift + Enter**: New line  

---

*Jerry can make mistakes. Verify important information.*
