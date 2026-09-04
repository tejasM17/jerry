import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "../features/auth/FirebaseAuthProvider";
import SocialAuthButtons from "../features/auth/SocialAuthButtons";

const SIGN_UP_BG = "https://i.ibb.co/S2sRnk7/dubi-set.webp";

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
        <form
          onSubmit={onSubmit}
          className="w-full rounded-2xl border border-white/15 bg-black/55 p-6 shadow-xl backdrop-blur-md"
        >
          <label className="block text-sm text-white/80">
            Display name
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/50"
            />
          </label>
          <label className="mt-4 block text-sm text-white/80">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/50"
            />
          </label>
          <label className="mt-4 block text-sm text-white/80">
            Password
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/50"
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
            className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-medium text-black disabled:opacity-60"
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
