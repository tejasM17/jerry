/**
 * Shared Clerk appearance: dark Jerry surfaces + hide footer branding.
 * Prefer elements over brittle .cl-* class hashes.
 */
export const clerkAppearance = {
  variables: {
    colorBackground: "#000000",
    colorInputBackground: "#000000",
    colorText: "#e5e7eb",
    colorTextSecondary: "#9ca3af",
    colorPrimary: "#7c5cfc",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full mx-auto",
    card: "bg-[#000000] border border-white/10 shadow-2xl",
    footer: "hidden",
    footerAction: "hidden",
    footerActionLink: "hidden",
    footerPages: "hidden",
    footerPagesLink: "hidden",
    badge: "hidden",
    internal: "hidden",
  },
};
