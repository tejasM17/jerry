import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYSrRLlg6ePt88iZynE2Bl8Ec7lgSF4JY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "jerry999-a281d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "jerry999-a281d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "jerry999-a281d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "677509575378",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:677509575378:web:91969faa65802386a2330b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { GoogleAuthProvider, GithubAuthProvider };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("user:email");

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signInWithGithub() {
  return signInWithPopup(auth, githubProvider);
}

export default app;
