# Jerry Frontend

  ## Overview
  Jerry is a real‑time chat application built with React, Vite and Firebase. Authenticated users can
  sign in, view a chat interface, update their profile photo, and log out. The app stores basic user
  data in Firestore and uploads avatars to Cloudinary.

  ## Goals
  1. Provide seamless email/password authentication via Firebase.
  2. Enable real‑time chat UI with a responsive sidebar.
  3. Allow users to update their profile picture and view basic account info.
  4. Persist user profile updates to Firestore.
  5. Ensure a smooth, animated UI using Tailwind CSS and Framer Motion.

  ## Core User Flow
  1. **Sign‑in** – User visits `/login` and authenticates with email/password via Firebase.
  2. **Protected Chat** – Authenticated users are routed to `/` (ChatPage). Unauthenticated users are
  redirected to `/login`.
  3. **Profile Management** – Via the profile menu, users can upload a new avatar (Cloudinary) and log
  out.
  4. **Logout** – User clicks *Log out* which signs them out of Firebase and returns to the login
  page.

  ## Features
  ### Authentication
  - Firebase Email/Password sign‑in and sign‑up.
  - Auth state listener (`onAuthStateChanged`).
  - `AuthProvider` context makes `user` available throughout the app.

  ### Chat Interface
  - `ChatPage` with a collapsible sidebar.
  - Uses custom `useChat` hook (not shown) for message handling.
  - Animated transitions via Framer Motion.

  ### Profile Management
  - `ProfileMenu` showing avatar, name, and email.
  - Photo upload to Cloudinary with progress UI.
  - Firestore write (`setDoc`) to persist `photoURL`.

  ### Routing & Layout
  - `react-router-dom` browser router with three routes (`/`, `/login`, `/register`).
  - Vite configuration (`vite.config.js`) for development and production builds.

  ## Scope
  ### In Scope
  - Firebase authentication and user profile storage.
  - Chat UI components and sidebar navigation.
  - Avatar upload via Cloudinary.
  - Responsive design using Tailwind.

  ### Out of Scope
  - Server‑side chat message persistence (handled elsewhere).
  - Real‑time collaboration canvas (not part of this repo).
  - Billing, subscriptions, or enterprise permissions.

  ## Success Criteria
  1. A signed‑in user can access the chat page; unauthenticated users are redirected to login.
  2. Users can upload a new avatar; the image appears in the UI and the `photoURL` is saved to
  Firestore.
  3. Logging out returns the user to the login screen and clears auth state.
  4. All routes load without errors in development (`npm run dev`).
  5. `npm run build` passes