import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

/**
 * Requires a signed-in Clerk session. Renders nested routes via <Outlet />.
 * While Clerk loads, shows a minimal full-screen placeholder.
 */
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[var(--surface,#000000)] text-[var(--text-secondary,#a3a3a3)]"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
            aria-hidden="true"
          />
          <span className="text-sm">Loading session…</span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}

/**
 * Public auth pages only — if already signed in, go to app home.
 */
export function PublicOnlyRoute() {
  const { isLoaded, isSignedIn } = useClerkAuth();

  if (!isLoaded) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#000000]"
        role="status"
        aria-live="polite"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-transparent"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
