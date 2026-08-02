/**
 * Shared Clerk appearance: glassy dark Jerry surfaces + hide footer branding.
 * Prefer elements over brittle .cl-* class hashes.
 */
export const clerkAppearance = {
  variables: {
    colorBackground: "rgba(0, 0, 0, 0.35)",
    colorInputBackground: "rgba(255, 255, 255, 0.08)",
    colorText: "#f5f5f5",
    colorTextSecondary: "rgba(255, 255, 255, 0.7)",
    colorPrimary: "#a78bfa",
    colorInputText: "#ffffff",
    colorNeutral: "rgba(255, 255, 255, 0.85)",
    borderRadius: "0.85rem",
  },
  elements: {
    rootBox: "w-full mx-auto",
    card: "backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl ring-1 ring-white/10 rounded-2xl",
    cardBox: "rounded-2xl",
    main: "gap-4",
    formButtonPrimary:
      "bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur",
    socialButtons:
      "backdrop-blur bg-white/5 border border-white/15 hover:bg-white/10",
    socialButtonsBlockButton:
      "backdrop-blur bg-white/5 border border-white/15 text-white hover:bg-white/10",
    socialButtonsBlockButtonText: "text-white font-medium",
    socialButtonsBlockButtonArrow: "text-white/70",
    dividerLine: "bg-white/20",
    dividerText: "text-white/60",
    formFieldLabel: "text-white/80",
    formFieldInput:
      "backdrop-blur bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-1 focus:ring-white/30",
    input: "text-white placeholder:text-white/40",
    formFieldInputShowPasswordButton: "text-white/70 hover:text-white",
    identityPreviewEditButton:
      "text-white/80 hover:text-white backdrop-blur bg-white/10 border border-white/20",
    formFieldAction: "text-white hover:text-white/80",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    footerPages: "hidden",
    footerPagesLink: "hidden",
    badge: "hidden",
    internal: "hidden",
    alert: "backdrop-blur bg-white/10 border border-white/20 text-white",
    alertText: "text-white",
    formResendCodeLink: "text-white hover:text-white/80",
    otpCodeFieldInput:
      "backdrop-blur bg-white/10 border border-white/25 text-white",
    formHeaderTitle: "text-white",
    formHeaderSubtitle: "text-white/70",
  },
};
