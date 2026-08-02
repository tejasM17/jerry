# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near‑black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

## Colors

[Define your color tokens as CSS custom properties.
All components must use these tokens — no hardcoded
hex values.]

| Role            | CSS Variable       | Hex / Value |
| --------------- | ------------------ | ----------- |
| Page background | `--surface`        | `#212121` |
| Surface         | `--surface-elevated` | `#303030` |
| Elevated surface| `--surface-overlay` | `#171717` |
| Subtle surface  | `--surface-sidebar` | `#171717` |
| Default border  | `--border-default` | `rgba(255,255,255,0.1)` |
| Subtle border   | `--border-subtle`   | `rgba(255,255,255,0.06)` |
| Primary text    | `--text-primary`    | `#e5e7eb` |
| Secondary text  | `--text-secondary` | `#9ca3af` |
| Muted text      | `--text-tertiary`   | `#6b6b6b` |
| Primary accent  | `--accent`          | `#7c5cfc` |
| Accent hover    | `--accent-hover`    | `#6a48e8` |
| Accent soft     | `--accent-soft`     | `rgba(124,92,252,0.12)` |
| Error           | `--danger`          | `#ef4444` |
| Success         | `--danger-hover`    | `#dc2626` |
## Typography

| Role      | Font           | CSS Variable      |
| --------- | --------------- | ----------------- |
| UI text   | Inter           | `--font-sans` |
| Code/mono | JetBrains Mono | `--font-mono` |

## Border Radius

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl` |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Component Library

shadcn/ui on top of Tailwind. Components live in `src/components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: full‑viewport layout — left sidebar (260 px) overlays on mobile, fixed on medium screens, central chat canvas, right AI sidebar (not present yet) overlay.
- Sidebars: floating overlay with dark semi‑transparent background (`bg-[var(--surface-sidebar)]`) and subtle border.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.
- Navbar: not used currently; top bar would have dark background and bottom border if added.

## Icons

Lucide React icons, stroke‑based only. Standard sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature illustrations.
