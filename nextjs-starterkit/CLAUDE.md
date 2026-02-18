# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack (localhost:3000)
npm run build      # Production build (includes TypeScript type check)
npm run start      # Start production server
npm run lint       # ESLint check
```

No test runner is configured. When adding tests, prefer Vitest + React Testing Library.

### Add shadcn/ui components

```bash
npx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` and configured via `components.json` (style: "new-york", baseColor: zinc).

## Architecture

### App Router structure

```
src/
├── app/              # Next.js App Router pages
│   ├── globals.css   # Tailwind v4 @theme + OKLCH color tokens (source of truth for design tokens)
│   └── layout.tsx    # Root layout: ThemeProvider > Header + main + Footer
├── components/
│   ├── ui/           # Primitive UI components (shadcn/ui, CVA-based)
│   └── layout/       # Header, Footer
├── lib/utils.ts      # cn() utility (clsx + tailwind-merge)
└── providers/        # Context providers (currently: ThemeProvider)
```

### Key architectural decisions

**Server Components by default.** Only add `"use client"` when the component uses hooks, browser APIs, or event handlers. `ThemeToggle` is the canonical example.

**CSS-first theming with Tailwind v4.** There is no `tailwind.config.js`. All design tokens (colors, radius) are defined as CSS variables using `@theme inline` in `globals.css`. Colors use the OKLCH color space. Dark mode is handled via the `.dark` CSS selector (applied by `next-themes`).

**CVA + Radix Slot for UI primitives.** All `ui/` components use Class Variance Authority for variant management and expose an `asChild` prop via `@radix-ui/react-slot` to allow polymorphic rendering (e.g., `<Button asChild><Link /></Button>`).

**React 19 patterns.** Do not use `forwardRef`. Pass `ref` as a regular prop. Use `React.ComponentProps<"element">` for prop types.

### Styling conventions

Use semantic CSS variable tokens rather than raw color values:
```tsx
// Correct
<div className="bg-background text-foreground border-border" />

// Avoid
<div className="bg-white text-gray-900" />
```

Use `cn()` from `@/lib/utils` for all conditional class merging.

### Path aliases

Always use `@/*` for imports — never use relative paths like `../../`.

```ts
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

### Hydration pattern for client-only state

Components that depend on client state (e.g., current theme) must handle SSR mismatches:

```tsx
"use client";
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <PlaceholderWithSameSize />;
```

### File naming

| Type | Convention | Example |
|------|-----------|---------|
| Component | `PascalCase.tsx` | `UserCard.tsx` |
| Utility / Hook | `camelCase.ts` | `useAuth.ts` |
| Page | `page.tsx` (fixed) | `app/dashboard/page.tsx` |
| Directory | `kebab-case` | `components/user-profile/` |
