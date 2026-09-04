import { useFirebaseAuth } from "./FirebaseAuthProvider";

/** Unified auth hook – after migration we only use Firebase. */
export const useCombinedAuth = () => {
  const { user, loading, signOut, getIdToken } = useFirebaseAuth();
  const isLoading = loading || user === undefined;
  const isSignedIn = !isLoading && !!user;
  return { user, loading: isLoading, isSignedIn, getIdToken, signOut };
};
