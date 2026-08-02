import { createBrowserRouter, Navigate } from "react-router-dom";
import ChatPage from "../features/chat/ChatPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ProfilePage from "../pages/ProfilePage";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "../features/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      // Empty composer — no session yet (ChatGPT / Grok home)
      { path: "/", element: <ChatPage /> },
      // Conversation session — public UUID sessionId
      { path: "/c/:sessionId", element: <ChatPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/dashboard", element: <Navigate to="/" replace /> },
      // Legacy: old ObjectId-only deep links still work if bookmarked as /chat/:id
      { path: "/chat/:sessionId", element: <ChatPage /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      // Legacy Firebase routes
      { path: "/login", element: <Navigate to="/sign-in" replace /> },
      { path: "/register", element: <Navigate to="/sign-up" replace /> },
    ],
  },
]);

export default router;
