/**
 * Suppress Clerk's "development keys" warning in the browser console.
 *
 * The warning is informational and correct (pk_test_ keys belong to the
 * Development Clerk instance). In local dev we already know that — Clerk
 * Dashboard → Production instance is what we use for production builds.
 *
 * Scope:
 *   - Dev only (gated on import.meta.env.DEV). Production builds remain
 *     untouched so any future real warning still surfaces.
 *   - Matches a narrow substring so unrelated Clerk warnings still print.
 */
const MESSAGE = "Clerk has been loaded with development keys";

export function suppressClerkDevWarning() {
  if (!import.meta.env.DEV) return;
  if (typeof console === "undefined" || !console.warn) return;

  const originalWarn = console.warn.bind(console);

  console.warn = (...args) => {
    const first = args[0];
    if (typeof first === "string" && first.includes(MESSAGE)) return;
    originalWarn(...args);
  };
}
