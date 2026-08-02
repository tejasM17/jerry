# Code Standards

## General

- Keep modules small and single‑purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect system boundaries defined in `architecture.md`.

##  JavaScript

- Strict mode (`"use strict"` ) is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Prefer `interface` for object contracts; keep types colocated with the component they describe.

## Next.js / React

- Default to **React Server Components** – only add `"use client"` when a component needs browser interactivity, hooks, or real‑time state.
- All route handlers (defined in `src/app/router.jsx`) must have a single responsibility and delegate heavy work to background services or API routes.
- Use the `AuthProvider` (wrapping the app in `src/main.jsx`) to gate protected routes; unauthenticated users are redirected to `/login`.
- Keep UI composition in `src/components/` (or `src/features/*/`); business logic belongs in hooks or the `lib/` layer.

## Styling & Tailwind

- Use **CSS custom property tokens** defined in `globals.css` (e.g. `bg-[var(--surface)]`, `text-[var(--text-primary)]`).
- Do **not** hard‑code raw hex values or Tailwind color classes like `zinc‑*`.
- Reference design tokens through Tailwind utilities that map to those custom properties (e.g. `bg-base`, `text-copy-primary`, `border-surface-border`).
- Follow the border‑radius scale: `rounded-xl` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals.

## API Routes (Backend)

- Validate and parse request input before any logic runs.
- Enforce auth and project ownership checks before any mutation.
- Return consistent, predictable response shapes.
- Keep route handlers thin — push complexity into shared modules (`lib/`) or background tasks.

## Data & Storage

- Project metadata and relationships belong in Fire store.
- Large generated content (e.g. images docs) belongs in MangoDB;
- Do not store large binary blobs directly in the database.
- Treat task‑run records as first‑class relational data; verify ownership and run IDs before any token issuance.

## File Organization

- `src/lib/` — shared infrastructure: Prisma client, auth helpers, utilities.
- `src/features/` — feature‑scoped UI and hooks (e.g. `auth`, `chat`).
- `src/components/` — pure UI composition; no business logic.
- `src/app/` — router and top‑level layout.
- `src/pages/` — auth pages (`Login`, `Register`).
- Name files after the responsibility they contain, not the technology (e.g. `ChatPage.jsx`, `AuthProvider.jsx`).

## Runtime & Performance

- Use `framer-motion` for animations; keep animation code declarative and avoid heavy computations inside render.
- Leverage React Suspense / lazy loading for large feature bundles where appropriate.
- Keep long‑running work out of request handlers; offload to background tasks or the `trigger/` directory.
