import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "./FirebaseAuthProvider";

function mapSocialError(err) {
  const code = err?.code || "";
  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return "Sign-in popup was closed.";
  }
  if (code.includes("account-exists-with-different-credential")) {
    return "An account already exists with this email. Sign in with the original method, then link providers in settings.";
  }
  if (code.includes("auth/popup-blocked")) {
    return "Popup was blocked. Allow popups for this site and try again.";
  }
  return err?.message || "Social sign-in failed.";
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.97 2.33-2.07 3.04l3.34 2.59c1.95-1.8 3.08-4.45 3.08-7.6 0-.73-.07-1.43-.19-2.11H12z" />
      <path fill="#34A853" d="M12 22c2.8 0 5.16-.93 6.88-2.52l-3.34-2.59c-.93.62-2.12.99-3.54.99-2.72 0-5.03-1.84-5.85-4.31H2.69v2.67C4.4 19.98 7.96 22 12 22z" />
      <path fill="#4A90E2" d="M6.15 13.57A5.99 5.99 0 0 1 5.82 12c0-.54.07-1.07.2-1.57V7.76H2.69A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.07 4.5l3.08-2.93z" />
      <path fill="#FBBC05" d="M12 6.12c1.52 0 2.89.52 3.97 1.55l2.98-2.98C17.15 2.95 14.79 2 12 2 7.96 2 4.4 4.02 2.69 7.76l3.33 2.67C6.97 7.96 9.28 6.12 12 6.12z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export default function SocialAuthButtons({ onError }) {
  const { signInWithGoogle, signInWithGithub } = useFirebaseAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const run = async (provider, fn) => {
    onError?.("");
    setBusy(provider);
    try {
      await fn();
      navigate("/", { replace: true });
    } catch (err) {
      onError?.(mapSocialError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/50">
        <span className="h-px flex-1 bg-white/20" />
        or continue with
        <span className="h-px flex-1 bg-white/20" />
      </div>
      <button
        type="button"
        disabled={!!busy}
        onClick={() => run("google", signInWithGoogle)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white py-2.5 text-sm font-medium text-neutral-900 disabled:opacity-60"
      >
        <GoogleIcon />
        {busy === "google" ? "Connecting…" : "Continue with Google"}
      </button>
      <button
        type="button"
        disabled={!!busy}
        onClick={() => run("github", signInWithGithub)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#24292f] py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        <GithubIcon />
        {busy === "github" ? "Connecting…" : "Continue with GitHub"}
      </button>
    </div>
  );
}
