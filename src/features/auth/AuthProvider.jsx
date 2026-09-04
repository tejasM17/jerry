import { createContext, useContext, useMemo, useEffect, useRef } from "react";
import { useFirebaseAuth } from "./FirebaseAuthProvider";
import { API_BASE } from "../../api/base";

const AuthContext = createContext({ user: undefined });

/**
 * Bridges Firebase Auth into the shape the rest of the app expects:
 *   - `user === undefined` while Firebase is initializing
 *   - `user === null` when signed out
 *   - `user` object with uid / email / displayName / photoURL / getIdToken()
 *
 * On sign‑in, fire‑and‑forget POST /api/auth/sync so Mongo user row exists
 * before the first chat list fetch.
 */
export const AuthProvider = ({ children }) => {
  const { user: firebaseUser, loading, getIdToken } = useFirebaseAuth();
  const syncedFor = useRef(null);

  const user = useMemo(() => {
    if (loading || firebaseUser === undefined) return undefined;
    if (!firebaseUser) return null;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      getIdToken: firebaseUser.getIdToken || getIdToken,
    };
  }, [loading, firebaseUser, getIdToken]);

  // Sync user profile to backend once per sign‑in
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
