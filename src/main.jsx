import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import router from "./app/router";
import "./index.css";
import { AuthProvider } from "./features/auth/AuthProvider";
import { clerkAppearance } from "./features/auth/clerkAppearance";
import { suppressClerkDevWarning } from "./features/auth/suppressClerkDevWarning";

// Silence the "development keys" console warning in dev only.
// Production builds still surface real warnings.
suppressClerkDevWarning();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env.development (Clerk Dashboard → API Keys).",
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl="/sign-in"
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    appearance={clerkAppearance}
  >
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-center" richColors closeButton />
    </AuthProvider>
  </ClerkProvider>,
);
