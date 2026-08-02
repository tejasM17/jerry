import { Link } from "react-router-dom";
import { SignUp } from "@clerk/clerk-react";
import { clerkAppearance } from "../features/auth/clerkAppearance";

const SIGN_UP_BG =
  "https://i.ibb.co/S2sRnk7/dubi-set.webp";

/**
 * Clerk-hosted sign-up: Google OAuth, email+password, username
 * (enable Username in Clerk Dashboard → User & authentication).
 */
const SignUpPage = () => {
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
            Get started with Jerry — Google, email, or username
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
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
          fallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
