import { SignIn } from "@clerk/clerk-react";
import { clerkAppearance } from "../features/auth/clerkAppearance";

/**
 * Clerk-hosted sign-in: Google OAuth, email+password, username+password,
 * and forgot-password are controlled by Clerk Dashboard settings.
 */
const SignInPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000000] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent" />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Sign in with Google, email, or username
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
