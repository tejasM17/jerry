import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCombinedAuth } from "./useCombinedAuth";

/**
 * Requires a signed-in Firebase session. Renders nested routes via <Outlet />.
 */
export function ProtectedRoute() {
  const { loading, isSignedIn } = useCombinedAuth();
  const location = useLocation();

      if (loading) {
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
  const { loading, isSignedIn } = useCombinedAuth();

      if (loading) {
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
