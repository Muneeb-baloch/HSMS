Design System — HSMS

Summary

- Global tokens live in `app/globals.css`.
- Use CSS variables (colors, spacing, radii, motion) for consistent styling.

Key tokens

- Colors: `--primary`, `--secondary`, `--accent`, `--background`, `--foreground`, sidebar tokens (`--sidebar`, `--sidebar-primary`, etc.).
- Spacing: `--space-1` .. `--space-6` (4px base).
- Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Motion: `--motion-duration-fast`, `--motion-duration`, `--motion-duration-slow`, `--motion-ease`.
- Typography: `--font-scale-sm`, `--font-scale-md`, `--font-scale-lg`.

Usage

- Prefer utility classes added in `app/globals.css`: `.animate-fade-in`, `.animate-fade-out`, `.skeleton`, `.sidebar-active-gradient`, `.motion-safe`, `.motion-reduce`, `.focus-outline`.
- For components, read tokens from CSS variables: `color: var(--primary)`, `border-radius: var(--radius-md)`.

Accessibility

- All animations respect `prefers-reduced-motion`.
- Focus states use `:focus-visible` and `.focus-outline`.
- Use `aria-current="page"` on active nav links (implemented in `components/nav-section.tsx`).

Integrations

- `components/Animation/PageTransition.tsx` wraps client content for fade transitions.
- `components/Animation/Skeleton.tsx` provides skeleton loader UI.

Next steps

- Customize `components/ui/*` (shadcn) to read tokens and add consistent spacing/rounded values.
- Add more micro-interactions and Framer Motion wrappers where necessary.
