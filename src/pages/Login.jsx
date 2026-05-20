import { useState, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, navigate]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleForgotPassword = useCallback(async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent!");
    } catch (err) {
      setError(err.message);
    }
  }, [email]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleLogin();
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#111] px-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1697730171668-d0d018aeebb2?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-transparent to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-sm"
      >
        <motion.div
          variants={itemVariants}
          custom={0}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
        >
          <motion.div variants={itemVariants} custom={1} className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-white/50">Sign in to your account</p>
          </motion.div>

          <motion.div variants={itemVariants} custom={2} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                spellCheck={false}
                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-white/30 focus:bg-white/[0.07] outline-none transition-all duration-200"
              />
            </div>

            <div className="relative">
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                className="w-full h-11 px-4 pr-11 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-white/30 focus:bg-white/[0.07] outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={18} />
                ) : (
                  <AiOutlineEye size={18} />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            custom={3}
            className="flex items-center justify-between text-sm"
          >
            <label className="flex items-center gap-2 text-white/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-purple-500"
              />
              Remember me
            </label>
            <button
              onClick={handleForgotPassword}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              Forgot password?
            </button>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-red-400 text-sm text-center"
                role="alert"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-emerald-400 text-sm text-center"
                role="status"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} custom={4} className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="relative w-full h-11 bg-white text-black rounded-xl font-medium text-sm hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FcGoogle className="text-lg" />
              Continue with Google
            </button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            custom={5}
            className="text-sm text-center text-white/40"
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-white/80 hover:text-white underline-offset-2 hover:underline transition-all"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
