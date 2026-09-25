import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "../features/auth/FirebaseAuthProvider";
import SocialAuthButtons from "../features/auth/SocialAuthButtons";

const SIGN_UP_BG = "/images/loginpage.svg";

const cardClass =
  "w-full rounded-[18px] border border-cyan-400/75 bg-[#061433]/45 p-6 shadow-[0_0_28px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(125,211,252,0.25)] backdrop-blur-xl";
const labelClass = "flex items-center gap-2 text-sm font-medium text-cyan-200";
const fieldClass =
  "mt-1.5 w-full rounded-xl border border-sky-400/55 bg-[#071428]/60 px-3 py-2.5 text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_16px_rgba(56,189,248,0.5)]";
const primaryClass =
  "mt-6 w-full rounded-xl bg-[#1a8cff] py-2.5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(37,140,255,0.6)] transition hover:bg-[#3aa0ff] hover:shadow-[0_0_28px_rgba(80,170,255,0.75)] disabled:opacity-60";

function UserIcon() {
  return (
    <svg className="h-4 w-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c1.4-2.6 3.7-3.9 6.5-3.9s5.1 1.3 6.5 3.9" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function mapAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  return err?.message || "Sign up failed.";
}

const SignUpPage = () => {
  const { signUp } = useFirebaseAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, displayName);
      navigate("/", { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000] px-4">
      <img
        src={SIGN_UP_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white drop-shadow">
            Create account
          </h1>
          <p className="mt-1 text-sm text-white/70 drop-shadow">
            Get started with Jerry — email and password
          </p>
          <p className="mt-3 text-sm text-white/80">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-medium text-white underline underline-offset-4 hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
        <form onSubmit={onSubmit} className={cardClass}>
          <label className="block">
            <span className={labelClass}>
              <UserIcon />
              Display name
            </span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block">
            <span className={labelClass}>
              <MailIcon />
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block">
            <span className={labelClass}>
              <LockIcon />
              Password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>
          {error ? (
            <p className="mt-3 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className={primaryClass}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
          <SocialAuthButtons onError={setError} />
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
