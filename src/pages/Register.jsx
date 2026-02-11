import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleRegister = async () => {
    try {
      // 1️⃣ Create account
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Set displayName
      await updateProfile(cred.user, {
        displayName: username,
      });

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

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat text-white px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 sm:p-10 w-full max-w-sm space-y-6 sm:space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Register</h2>

        <input
          type="text"
          placeholder="Enter your username"
          className="w-full py-3 bg-transparent border-b border-white/50 placeholder-white/70 focus:border-white outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />

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

        <button
          onClick={handleRegister}
          className="w-full bg-white text-black py-3 rounded-md font-semibold hover:bg-gray-100 transition"
        >
          Register
        </button>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-transparent border border-white/50 text-white py-3 rounded-md flex items-center justify-center gap-2 hover:bg-white/10 transition"
        >
          <FcGoogle className="text-xl" />
          Sign up with Google
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
