import { useState } from "react";
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat text-white px-4"
      style={{
        backgroundImage:
          "url('https://plus.unsplash.com/premium_photo-1697730171668-d0d018aeebb2?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 sm:p-10 w-full max-w-sm space-y-6 sm:space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full py-3 bg-transparent border-b border-white/50 placeholder-white/70 focus:border-white outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter your password"
          className="w-full py-3 bg-transparent border-b border-white/50 placeholder-white/70 focus:border-white outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 accent-white bg-transparent border-white/50"
            />
            Remember me
          </label>
          <button onClick={handleForgotPassword} className="hover:underline">
            Forgot password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          Log In
        </button>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-transparent border border-white/50 text-white py-3 rounded-md flex items-center justify-center gap-2 hover:bg-white/10 transition"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>

        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-white hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
