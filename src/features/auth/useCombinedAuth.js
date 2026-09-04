import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useFirebaseAuth } from "./FirebaseAuthProvider";

/**
 * Unified auth hook that works with either Clerk or Firebase based on a feature flag.
 * Returns a shape compatible with the existing code:
 *   {
 *     user,
 *     loading,
 *     isSignedIn,
 *     getIdToken,
 *   }
 */
export const useCombinedAuth = () => {
  const useFirebase = import.meta.env.VITE_USE_FIREBASE_AUTH === "true";

  if (useFirebase) {
    const { user, loading, signOut } = useFirebaseAuth();
    const isSignedIn = !!user;
    const getIdToken = user?.getIdToken;
    return { user, loading, isSignedIn, getIdToken, signOut };
  }

  // Fallback to Clerk
  const { isLoaded, isSignedIn, user, getToken: getIdToken } = useClerkAuth();
  // Clerk's `isLoaded` indicates loading state; map to `loading`.
  const loading = !isLoaded;
  return { user, loading, isSignedIn, getIdToken };
};
