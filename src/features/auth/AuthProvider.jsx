import { createContext, useContext, useMemo, useEffect, useRef } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { API_BASE } from "../../api/base";

const AuthContext = createContext({ user: undefined });

/**
 * Bridges Clerk session into the shape the rest of the app expects:
 * - `user === undefined` while Clerk is loading
 * - `user === null` when signed out
 * - `user` object with uid / email / displayName / photoURL / getIdToken()
 *
 * On sign-in, fire-and-forget POST /api/auth/sync so Mongo user row exists
 * before the first chat list fetch.
 */
export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, userId } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const syncedFor = useRef(null);

  const user = useMemo(() => {
    if (!isLoaded) return undefined;
    if (!isSignedIn || !clerkUser) return null;

    const primaryEmail =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      "";

    return {
      uid: userId,
      email: primaryEmail,
      displayName:
        clerkUser.fullName ||
        clerkUser.username ||
        primaryEmail.split("@")[0] ||
        "User",
      photoURL: clerkUser.imageUrl || null,
      username: clerkUser.username || null,
      /** Session JWT for jerry-api. */
      getIdToken: async () => getToken(),
      clerkUser,
    };
  }, [isLoaded, isSignedIn, clerkUser, userId, getToken]);

  useEffect(() => {
    if (!user?.uid || !user.getIdToken) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user.uid) return;
    syncedFor.current = user.uid;

    let cancelled = false;
    (async () => {
      try {
        const token = await user.getIdToken();
        if (cancelled || !token) return;
        await fetch(`${API_BASE}/auth/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        });
      } catch (err) {
        console.warn("[auth] profile sync skipped:", err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(() => ({ user }), [user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
