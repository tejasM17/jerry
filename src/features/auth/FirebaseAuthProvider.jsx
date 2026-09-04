import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, signInWithGoogle, signInWithGithub } from "../../lib/firebase";

const FirebaseAuthContext = createContext({
  user: undefined,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
});

export const FirebaseAuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          photoURL: user.photoURL || null,
          getIdToken: () => user.getIdToken(),
        });
      } else {
        setFirebaseUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    return cred;
  };

  const signOut = () => firebaseSignOut(auth);

  const user = useMemo(() => {
    if (loading) return undefined;
    if (!firebaseUser) return null;
    return firebaseUser;
  }, [loading, firebaseUser]);

  const getIdToken = async () => {
    if (!firebaseUser?.getIdToken) return null;
    return firebaseUser.getIdToken();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      getIdToken,
    }),
    [user, loading, firebaseUser],
  );

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);
