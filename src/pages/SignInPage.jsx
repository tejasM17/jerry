import { Link } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { clerkAppearance } from "../features/auth/clerkAppearance";

const SIGN_IN_BG =
  "https://i.ibb.co/SDLGPsnD/mountev.webp";

/**
 * Clerk-hosted sign-in: Google OAuth, email+password, username+password,
 * and forgot-password are controlled by Clerk Dashboard settings.
 */
const SignInPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000] px-4">
      <img
        src={SIGN_IN_BG}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white drop-shadow">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-white/70 drop-shadow">
            Sign in with Google, email, or username
          </p>
          <p className="mt-3 text-sm text-white/80">
            New here?{" "}
            <Link
              to="/sign-up"
              className="font-medium text-white underline underline-offset-4 hover:text-white"
            >
              Create an account
            </Link>
          </p>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/"
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
};

export default SignInPage;
