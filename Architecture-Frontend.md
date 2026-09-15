

  1️⃣  Project Overview

  Jerry AI is a browser‑based chat interface built with React 19 on top of Vite 7.
  The UI is a single‑page application (SPA) that authenticates users via Firebase Auth, then talks to a backend API
  (http://localhost:5000/api) for chat persistence, user profiles and session management.

  Key characteristics:

  ┌────────────┬──────────────────────────────────────────────────────┐
  │  Feature   │                        Detail                        │
  ├────────────┼──────────────────────────────────────────────────────┤
  │ Framework  │ React 19 (hooks‑only, functional components)         │
  ├────────────┼──────────────────────────────────────────────────────┤
  │ Build tool │ Vite 7 (fast HMR, ES‑modules)                         │
  ├────────────┼───────────────────────────────────────────────────────┤
  │ Styling     │ Tailwind 4 + CSS custom properties (dark‑only theme)                           │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ Animations  │ Framer Motion (layout & menu transitions)                                      │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ Routing     │ React‑Router v7 (browser router)                                               │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ Auth        │ Firebase client SDK (email/password + Google/GitHub)                           │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ API client  │ Tiny wrapper around fetch that injects a Firebase JWT                          │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ State       │ React useState/useEffect, context for auth, custom useChat hook for chat state │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ Persistence │ localStorage for UI‑only flags (sidebar collapse, pinned chats)                │
  ├─────────────┼────────────────────────────────────────────────────────────────────────────────┤
  │ Streaming   │ Server‑sent event (plain‑text) processed by readTextStream in src/api/chat.js  │
  └─────────────┴────────────────────────────────────────────────────────────────────────────────┘

  ---

  2️⃣  High‑Level Architecture Diagram

  mermaid
  flowchart LR
      Browser[Browser] -->|Loads| ReactApp[React App (Vite dev server)]
      ReactApp -->|Uses| FirebaseAuth[Firebase Auth (client SDK)]
      FirebaseAuth -->|Provides JWT| APIClient[API Client (fetch wrapper)]
      APIClient -->|Bearer token| Backend[Backend API (localhost:5000)]
      ReactApp -->|Local UI state| UIState[Sidebar UI State\n(pin, collapse) via localStorage]
      classDef external fill:#f9f,stroke:#333,stroke-width:2px;
      class Backend,FirebaseAuth external;

  The diagram illustrates the flow from the user’s browser down to the backend, including the UI‑only state that lives 
  entirely in the frontend.

  ---

  3️⃣  Complete Folder & File Structure

  src/
  ├─ api/                     # Thin fetch wrappers for the backend
  │  ├─ base.js               # API_BASE constant (VITE_API_BASE_URL)
  │  ├─ chat.js               # Chat endpoints + streaming helper
  │  └─ profile.js            # Profile CRUD endpoints
  ├─ app/
  │  └─ router.jsx            # React‑Router v7 route definitions
  ├─ assets/
  │  └─ jerry.svg             # App logo (used in UI)
  ├─ const/
  │  └─ ProfileMenu.jsx       # Bottom‑left user menu (profile & settings)
  ├─ features/
  │  ├─ auth/
  │  │  ├─ AuthProvider.jsx   # High‑level auth context (bridges Firebase)
  │  │  ├─ FirebaseAuthProvider.jsx
  │  │  ├─ ProtectedRoute.jsx # Route guard for signed‑in users
  │  │  ├─ PublicOnlyRoute.jsx
  │  │  ├─ SocialAuthButtons.jsx
  │  │  └─ useCombinedAuth.js
  │  ├─ chat/
  │  │  ├─ ChatPage.jsx       # Top‑level page, contains Sidebar + ChatWindow
  │  │  ├─ ChatWindow.jsx    # Transcript + composer
  │  │  ├─ ChatInput.jsx      # Message composer, file upload UI
  │  │  ├─ MessageBubble.jsx  # Render individual messages (markdown, attachments)
  │  │  ├─ Sidebar.jsx        # Chat list, pinning, collapse, context menu
  │  │  ├─ SearchChatsModal.jsx
  │  │  ├─ useChat.js         # Hook that drives all chat state & API calls
  │  │  └─ hooks/
  │  │     └─ useDebounce.js
  │  └─ profile/
  │     ├─ EditProfileModal.jsx
  │     └─ SettingsModal.jsx
  ├─ lib/
  │  └─ firebase.js           # Firebase initialization & OAuth providers
  ├─ pages/
  │  ├─ ProfilePage.jsx       # Legacy route – opens EditProfileModal
  │  ├─ SignInPage.jsx
  │  └─ SignUpPage.jsx
  ├─ index.css                 # Tailwind import + CSS variables for dark theme
  ├─ main.jsx                  # Application entry point (ReactDOM + providers)
  └─ vite.config.js            # Vite + Tailwind plugin configuration

  Each file listed above contains a concise description in the comment header or is inferred from its name.

  ---

  4️⃣  Technology Stack

  ┌──────────────┬──────────────────┬──────────┬───────────────────────────────────────────────────────┐
  │    Layer     │  Library / Tool  │ Version  │                         Usage                         │
  ├──────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Framework    │ react            │ ^19.2.0  │ Component model & hooks                               │
  ├──────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ DOM renderer │ react-dom        │ ^19.2.0  │ Root rendering                                        │
  ├──────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Build / Dev      │ vite             │ ^7.3.1   │ Fast bundling & HMR                                   │
  ├──────────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Styling          │ tailwindcss      │ ^4.3.3   │ Utility‑first CSS (dark theme)                        │
  ├──────────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Animations       │ framer-motion    │ ^12.34.0 │ Declarative motion & transitions                      │
  ├──────────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Routing          │ react-router-dom │ ^7.13.0  │ SPA navigation                                        │
  ├──────────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Auth             │ firebase         │ ^12.18.0 │ Firebase Auth client (email/password, Google, GitHub) │
  ├──────────────────┼──────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Markdown         │ react-markdown                 │ ^10.1.0  │ Render assistant messages                             │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Markdown plugins │ remark-gfm                     │ ^4.0.1   │ GitHub‑flavored markdown                              │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │                  │ rehype-highlight               │ ^7.0.2   │ Code block syntax highlighting                        │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Icons            │ react-icons                    │ ^5.5.0   │ UI icons (Fi*, Lu*, Bs*)                              │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Notifications    │ sonner                         │ ^2.0.7   │ Toasts for errors / status                            │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Utility          │ canvas-confetti                │ ^1.9.4   │ Celebration effects (unused in core)                  │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Type definitions │ @types/react, @types/react-dom │ ^19.2.x  │ Development only                                      │
  ├──────────────────┼────────────────────────────────┼──────────┼───────────────────────────────────────────────────────┤
  │ Linters          │ eslint + plugins               │ ^9.39.1  │ Code quality                                          │
  └──────────────────┴────────────────────────────────┴──────────┴───────────────────────────────────────────────────────┘

  ---

  5️⃣  Authentication Flow

  1. Firebase initialization – src/lib/firebase.js creates a Firebase app using environment variables (VITE_FIREBASE_*).
  2. Sign‑in – SignInPage / SignUpPage call signInWithEmailAndPassword, createUserWithEmailAndPassword, or OAuth helpers
     (signInWithGoogle, signInWithGithub).
  3. Auth context – FirebaseAuthProvider tracks the user via onAuthStateChanged. useFirebaseAuth exposes user, loading,
     signIn, signOut, signUp, signInWithGoogle, signInWithGithub, and getIdToken.
  4. Bridge – AuthProvider consumes useFirebaseAuth and normalizes the shape (user object with uid, email, displayName,
     photoURL, getIdToken).
  5. Backend sync – On first sign‑in, AuthProvider POSTs {} to /api/auth/sync with the JWT to ensure a corresponding MongoDB
     user document exists.
  6. API calls – All API helpers (fetchAllChats, postChatStream, fetchProfile, etc.) call authHeaders(getToken) which:
     - Awaits getToken() from the auth context,
     - Returns { Authorization: 'Bearer <jwt>', ...extra },
     - The JWT is attached as Bearer header to every request.

  Result: every request to the backend can be validated server‑side using the Firebase ID token.

  ---

  6️⃣  Routing Structure

  ┌──────────────────┬─────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
  │       Path       │              Component              │                            Notes                             │
  ├──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ /                │ ChatPage                            │ Home – empty composer if no session                          │
  ├──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ /c/:sessionId    │ ChatPage                            │ Load/continue a public UUID chat session                     │
  ├──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ /chat/:sessionId │ ChatPage                            │ Legacy deep‑link (ObjectId) – kept for backward              │
  │                  │                                     │ compatibility                                                │
  ├──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ /profile         │ ProfilePage (opens                  │ User profile editing                                         │
  ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ /sign‑in/*       │ SignInPage                      │ Email/password + social login                                    │
  ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ /sign‑up/*       │ SignUpPage                      │ Account creation                                                 │
  ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ /login           │ <Navigate to="/sign‑in" />      │ Legacy redirect                                                  │
  ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ /register        │ <Navigate to="/sign‑up" />      │ Legacy redirect                                                  │
  ├──────────────────┼─────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ /* (any other)   │ ProtectedRoute (requires auth)  │ All other paths are guarded‑by ProtectedRoute (or                │
  │                  │                                 │ PublicOnlyRoute for auth pages)                                  │
  └──────────────────┴─────────────────────────────────┴──────────────────────────────────────────────────────────────────┘

  The router is defined in src/app/router.jsx. All protected routes are wrapped by <ProtectedRoute />; public‑only pages
  (sign‑in/up) use <PublicOnlyRoute />.

  ---

  7️⃣  State Management Approach

  ┌───────────┬────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┐
  │  Scope   │                      Technique                       │                      Details                       │
  ├──────────┼──────────────────────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ Global Auth   │ React Context (AuthProvider) + custom hook         │ Provides {user, loading, getIdToken, signOut} to │
  │               │ (useAuth)                                          │  the whole tree.                                 │
  ├───────────────┼────────────────────────────────────────────────────┼──────────────────────────────────────────────────┤
  │               │                                                    │ useChat(user) returns messages, loading,         │
  │ Chat UI state  │ Component‑local useState + custom useChat hook     │ activeChatId, activeChatTitle, sendMessage,     │
  │                │                                                    │ editMessage, loadChat, createNewChat,           │
  │                │                                                    │ renameChat, deleteChat.                         │
  ├────────────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │                │ useState (collapsed, pinnedIds, menu) +            │ Collapse state is read on mount, persisted on   │
  │ Sidebar UI     │ localStorage persistence (jerry.sidebar.collapsed, │ change. Pinning is an array of chat identifiers │
  │                │  jerry.sidebar.pinnedChatIds)                      │  stored as JSON.                                │
  ├────────────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ Modals         │                                                    │                                                 │
  │ (Profile /     │ useState toggles (isOpen)                          │ Rendered via portal (createPortal).             │
  │ Settings)      │                                                    │                                                 │
  ├────────────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ Form input     │ useDebounce custom hook (simple timeout)           │ Used in profile username availability check and │
  │ debouncing     │                                                    │  search modal.                                  │
  ├────────────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ Streaming      │ Internal readTextStream (API) updates a            │                                                 │
  │ response       │ “streaming” message in messages array via          │                                                 │
  │                │ setMessages.                                       │                                                 │
  ├────────────────┼────────────────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ Theme          │ Pure CSS variables (dark only) – set in :root of   │                                                 │
  │                │ index.css. No runtime toggling.                    │                                                 │
  └────────────────┴────────────────────────────────────────────────────┴─────────────────────────────────────────────────┘

  No external state library (Redux, Zustand) is used; the app relies on React’s built‑in capabilities and well‑scoped custom
  hooks.

  ---

  8️⃣  API Client Layer

  Base URL – src/api/base.js:

  export const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  Auth helper – inside src/api/chat.js (and profile.js):

  async function authHeaders(getToken, extra = {}) {
    const token = await getToken();
    return {
      Authorization: `Bearer ${token}`,
      ...extra,
    };
  }

  All exported functions (fetchAllChats, postChatStream, fetchProfile, etc.) call authHeaders before fetch.

  Streaming helper – readTextStream(response, onChunk):

  - Uses response.body.getReader() to read UTF‑8 chunks.
  - Calls onChunk(full, chunk) after each read, allowing the UI to keep a “streaming” bubble updated in real time.

  Error handling – Every fetch checks res.ok, otherwise throws an Error with a concise message (e.g. “Failed to fetch chats”).

  
  File upload – uploadChatFile sends a FormData payload; the response is normalized and the URL is resolved against API_BASE
  when needed.

  ---

  9️⃣  Feature Modules Breakdown

  ┌─────────┬─────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┐
  │  Module   │               Core Files                │                        Responsibilities                         │
  ├───────────┼─────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │           │ src/lib/firebase.js,                    │ Initialize Firebase, expose sign‑in/up APIs, provide a bridge   │
  │ Auth      │ src/features/auth/*                     │ (AuthProvider) that normalizes the user shape and syncs it with │
  │           │                                         │  the backend.                                                   │
  ├───────────┼─────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
  │           │ src/features/chat/*, src/api/chat.js,   │ UI for chat list (Sidebar), chat window, composer, streaming    │
  │ Chat       │ src/features/chat/*, src/api/chat.js,         │ streaming response handling, CRUD (new, rename,         │
  │            │ src/features/chat/useChat.js                  │ delete), search modal, optimistic UI updates, and       │
  │            │                                               │ URL‑driven session navigation.                          │
  ├────────────┼───────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │            │                                               │ Edit profile UI (name, username, avatar), username      │
  │ Profile    │ src/features/profile/*, src/api/profile.js    │ availability check, avatar upload, settings modal       │
  │            │                                               │ (language, appearance).                                 │
  ├────────────┼───────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ Routing    │ src/app/router.jsx                            │ Define protected and public routes, map URL parameters  │
  │            │                                               │ to components.                                          │
  ├────────────┼───────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │ Styling &  │ src/index.css                                 │ Dark‑only CSS custom properties, Tailwind utilities,    │
  │ Theme      │                                               │ global animation keyframes.                             │
  ├────────────┼───────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
  │            │ src/features/chat/hooks/useDebounce.js,       │ Debounce helper, user menu (profile & settings),        │
  │ Utilities  │ src/const/ProfileMenu.jsx                     │ localStorage helpers are embedded directly in           │
  │            │                                               │ components.                                             │
  └────────────┴───────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘

  ---

  10️⃣  Sidebar Architecture

  - Component: src/features/chat/Sidebar.jsx
  - Key UI elements:
    - Chat list – fetched via fetchAllChats using the current Firebase token.
    - Pinned chats – stored in localStorage under key jerry.sidebar.pinnedChatIds as a JSON array.
    - Collapse state – persisted under jerry.sidebar.collapsed ("1" = collapsed, "0" = expanded).
    - Context menu – rendered on right‑click with createPortal; options include open in new tab, rename, pin/unpin, delete.
    - Search modal – toggles SearchChatsModal, which debounces the input and either loads recent chats (fetchRecentChats) or
      performs a server search (searchChats).

  - Animations: framer-motion for slide‑in/out and menu fade.
  - Responsive behavior:
    - Collapsed width (52px) on desktop when collapsed, full width (260px) otherwise.
    - On mobile (<md), the sidebar becomes a temporary drawer (motion.aside) that slides in/out.

  ---

  11️⃣  Streaming Response Handling

  1. POST request – postChatStream(getToken, { chatId, prompt, attachments }) sends a JSON payload.
  2. Response – The server returns a streaming text/plain body.
  3. Reader – readTextStream (defined in src/api/chat.js) reads the body chunk‑by‑chunk, concatenates the full text, and
     invokes the onChunk callback.
  4. UI update – In useChat.sendMessage & editMessage, each chunk updates the messages array with a temporary role: 
     "streaming" entry, which renders an animated “typing” bubble (MessageBubble).
  5. Completion – When the stream ends, the temporary entry is replaced with a final assistant message, preserving the full
     content and optionally the requestId for URL sync.

  The streaming UI shows a three‑dot animation while waiting for data.

  ---

  12️⃣  Theme System

  - Theme: Dark‑only (no light toggle).
  - Implementation: CSS custom properties in src/index.css under :root. Example:

  :root {
    --surface: #000000;
    --surface-elevated: #000000;
    --border-subtle: rgba(255,255,255,.06);
    --text-primary: #e5e7eb;
    --accent: #7c5cfc;
    /* …more colors */
  }

  All UI components reference these vars (var(--surface), var(--text-primary), etc.) ensuring a consistent dark appearance.

  The Settings modal displays “Appearance → Dark” as a static label; there is no runtime theme switch.

  ---

  13️⃣  Key Components & Their Responsibilities

  ┌───────────────────────────┬──────────────────────────────────────┬────────────────────────────────────────────────────┐
  │         Component         │                 File                 │                   Responsibility                   │
  ├───────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ RouterProvider            │ src/main.jsx                         │ Boots the React Router with the route map.         │
  ├───────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ AuthProvider              │ src/features/auth/AuthProvider.jsx   │ Exposes a memoized user object + syncs to backend. │
  ├───────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ ProtectedRoute /          │ src/features/auth/ProtectedRoute.jsx │ Guard routes based on auth state.                  │
  │ PublicOnlyRoute           │                                      │                                                    │
  ├───────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ Sidebar                   │ src/features/chat/Sidebar.jsx        │ Left navigation: chat list, pinning, collapse,     │
  │                           │                                      │ context menu, search modal.                        │
  ├─────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
  │ ChatPage                │ src/features/chat/ChatPage.jsx       │ Layout wrapper; loads chat hook, renders Sidebar +   │
  │                         │                                      │ ChatWindow.                                          │
  ├─────────────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ ChatWindow              │ src/features/chat/ChatWindow.jsx       │ Transcript scroll, top bar, docked composer,       │
  │                         │                                        │ scroll‑to‑bottom button.                           │
  ├─────────────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ ChatInput               │ src/features/chat/ChatInput.jsx        │ Message composer, attachment menu, send button,    │
  │                         │                                        │ auto‑resize textarea.                              │
  ├─────────────────────────┼────────────────────────────────────────┼────────────────────────────────────────────────────┤
  │ MessageBubble           │ src/features/chat/MessageBubble.jsx    │ Renders user/assistant messages (markdown,         │
  │ MessageBubble           │ src/features/chat/MessageBubble.jsx       │ Renders user/assistant messages (markdown,      │
  │                         │                                           │ attachments, edit UI, streaming indicator).     │
  ├─────────────────────────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ useChat                 │ src/features/chat/useChat.js              │ Central chat state: load chats, send messages,  │
  │                         │                                           │ edit, rename, delete, URL sync.                 │
  ├──────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ SearchChatsModal         │ src/features/chat/SearchChatsModal.jsx     │ Modal for recent chats & search, debounced    │
  │                          │                                            │ input.                                        │
  ├──────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ ProfileMenu              │ src/const/ProfileMenu.jsx                  │ Bottom‑left user avatar menu; opens profile   │
  │                          │                                            │ or settings modals; logout.                   │
  ├──────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ EditProfileModal         │ src/features/profile/EditProfileModal.jsx  │ Edit display name, username, avatar; validate │
  │                          │                                            │  & upload.                                    │
  ├──────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │ SettingsModal            │ src/features/profile/SettingsModal.jsx     │ UI only: appearance (fixed to Dark), language │
  │                          │                                            │  selector, link to profile.                   │
  ├──────────────────────────┼────────────────────────────────────────────┼───────────────────────────────────────────────┤
  │                          │                                                │ language selector, link to profile.       │
  ├──────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ FirebaseAuthProvider     │ src/features/auth/FirebaseAuthProvider.jsx     │ Listens to Firebase auth changes;         │
  │                          │                                                │ provides sign‑in/out functions.           │
  ├──────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ SocialAuthButtons        │ src/features/auth/SocialAuthButtons.jsx        │ Buttons for Google / GitHub sign‑in,      │
  │                          │                                                │ error mapping.                            │
  ├──────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ SignInPage / SignUpPage  │ src/pages/*.jsx                                │ Public auth pages, form handling, error   │
  │                          │                                                │ mapping.                                  │
  ├──────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ API modules              │ Provide thin wrappers around fetch with JWT    │                                           │
  │ (src/api/*.js)           │ injection.                                     │                                           │
  ├──────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────┤
  │ readTextStream           │ src/api/chat.js                                │ Helper for reading streaming responses.   │
  └──────────────────────────┴────────────────────────────────────────────────┴───────────────────────────────────────────┘

  ---

  14️⃣  Environment Variables (VITE_*)

  ┌──────────────────────────────┬───────────────────────────────────────────┬─────────────────────────────────────────────┐
  │           Variable           │            Default (fallback)             │                   Purpose                   │
  ├──────────────────────────────┼───────────────────────────────────────────┼─────────────────────────────────────────────┤
  │ VITE_API_BASE_URL            │ http://localhost:5000/api                 │ Base URL for all backend API calls.         │
  ├───────────────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────┤
  │ VITE_FIREBASE_API_KEY             │ "AIzaSyBYSrRLlg6ePt88iZynE2Bl8Ec7lgSF4JY" │ Firebase project API key.              │
  ├───────────────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────┤
  │ VITE_FIREBASE_AUTH_DOMAIN         │ "jerry999-a281d.firebaseapp.com"            │ Firebase Auth domain.                │
  ├───────────────────────────────────┼─────────────────────────────────────────────┼──────────────────────────────────────┤
  │ VITE_FIREBASE_PROJECT_ID          │ "jerry999-a281d"                            │ Firebase project identifier.         │
  ├───────────────────────────────────┼─────────────────────────────────────────────┼──────────────────────────────────────┤
  │ VITE_FIREBASE_STORAGE_BUCKET      │ "jerry999-a281d.firebasestorage.app"        │ Firebase storage bucket (used for    │
  │                                   │                                             │ profile avatar uploads).             │
  ├───────────────────────────────────┼─────────────────────────────────────────────┼──────────────────────────────────────┤
  │ VITE_FIREBASE_MESSAGING_SENDER_ID │ "677509575378"                              │ Firebase Cloud Messaging sender ID   │
  │                                   │                                             │ (unused in UI).                      │
  ├───────────────────────────────────┼─────────────────────────────────────────────┼──────────────────────────────────────┤
  │ VITE_FIREBASE_APP_ID              │ "1:677509575378:web:91969faa65802386a2330b" │ Firebase app identifier.             │
  └───────────────────────────────────┴─────────────────────────────────────────────┴──────────────────────────────────────┘

  All variables are accessed via import.meta.env.VITE_... and are automatically injected at build time by Vite.

  ---

  15️⃣  Sequence Diagram – “User Sends a Message → Streaming Response”

  mermaid
  sequenceDiagram
      participant U as User (browser)
      participant UI as ChatInput
      participant CH as useChat Hook
      participant API as API Client (fetch)
      participant BE as Backend (localhost:5000)

      U->>UI: Type message + optional attachments
      UI->>CH: onSend(prompt, attachments)
      CH->>CH: Optimistically add user message to state
      CH->>API: POST /chat/new or /chat/:id/continue (Authorization: Bearer <JWT>)
      API->>BE: Request
      BE-->>API: Streamed plain‑text response (chunks)
      API->>CH: readTextStream(chunk) each time
      CH->>CH: Update “streaming” assistant bubble with accumulated text
      BE-->>API: End of stream (final chunk)
      API->>CH: Resolve with final response object
      CH->>CH: Replace streaming bubble with final assistant message
      CH->>UI: Update transcript, clear composer
      UI->>U: Render new assistant bubble (complete answer)

  The diagram captures the optimistic UI update, JWT‑protected request, and live streaming handling.

  ---

  16️⃣  Version & Maintenance

  - Package version: 0.0.0 (see package.json).
      CH->>CH: Replace streaming bubble with final assistant message
      CH->>UI: Update transcript, clear composer
      UI->>U: Render new assistant bubble (complete answer)

  The diagram captures the optimistic UI update, JWT‑protected request, and live streaming handling.

  ---

  16️⃣  Version & Maintenance
 
  - Last audited: 2026‑09‑15.
  - Future considerations:
    - Add a light‑mode toggle (currently not required).
    - Replace custom streaming logic with WebSocket or SSE for lower latency.
    - Centralize UI‑only state (collapse, pinning) into a tiny React Context for easier testing.

  ---

  All sections above are derived directly from the Jerry AI Frontend codebase; no speculative features are introduced.