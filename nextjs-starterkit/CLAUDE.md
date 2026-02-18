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

### 4-Layer Component Hierarchy

Dependency flows **downward only**: Layer 4 → 3 → 2 → 1.

```
Layer 1 — UI Primitives    src/components/ui/         (shadcn/ui via CLI, never hand-edit)
Layer 2 — Layout           src/components/layout/     (structural wrappers, Server Components)
Layer 3 — Common           src/components/common/     (domain-agnostic composites)
Layer 4 — Features         src/features/<domain>/     (business logic, pages, API calls)
```

### App Router structure

```
src/
├── app/
│   ├── globals.css         # Tailwind v4 @theme + OKLCH color tokens (source of truth)
│   ├── layout.tsx          # Root: ThemeProvider > QueryProvider > Header/main/Footer + Toaster
│   ├── page.tsx            # Home — 4-layer showcase
│   ├── loading.tsx         # Route-level Skeleton loading UI
│   ├── error.tsx           # Global error boundary ("use client")
│   └── not-found.tsx       # 404 page (Server Component)
├── components/
│   ├── ui/                 # Layer 1: shadcn/ui primitives (Button, Card, Badge, Dialog…)
│   ├── layout/             # Layer 2: Container, Section, PageHeader, ContentLayout, SidebarLayout
│   └── common/             # Layer 3: StatCard, EmptyState, LoadingSpinner, UserAvatar,
│                           #          DataTable, ConfirmDialog, SearchInput, PaginationControls
├── features/
│   ├── auth/               # components/ hooks/ schemas/ types.ts
│   ├── users/              # components/ hooks/ types.ts
│   └── dashboard/          # components/ types.ts
├── hooks/
│   ├── useDebounce.ts      # Generic debounce hook
│   ├── useLocalStorage.ts  # SSR-safe localStorage hook
│   ├── useToast.ts         # Sonner wrapper (success/error/warning/info/promise)
│   └── use-mobile.ts       # Shadcn mobile breakpoint hook (auto-generated)
├── lib/
│   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   └── schemas.ts          # Shared Zod schemas (email, password, name, url, paginated)
└── providers/
    ├── theme-provider.tsx  # next-themes wrapper
    └── query-provider.tsx  # TanStack Query (staleTime 60s) + ReactQueryDevtools
```

### Key libraries

| Library | Purpose |
|---------|---------|
| `react-hook-form` + `@hookform/resolvers` | Form state management |
| `zod` | Schema validation (use with RHF via zodResolver) |
| `@tanstack/react-query` | Server state, caching, async mutations |
| `sonner` | Toast notifications (via `useToast` hook or direct `toast.*`) |
| `date-fns` | Date formatting and manipulation |
| `next-themes` | Dark/light mode |

### Key architectural decisions

**Server Components by default.** Only add `"use client"` when the component uses hooks, browser APIs, or event handlers. `ThemeToggle` is the canonical example.

**CSS-first theming with Tailwind v4.** There is no `tailwind.config.js`. All design tokens (colors, radius) are defined as CSS variables using `@theme inline` in `globals.css`. Colors use the OKLCH color space. Dark mode is handled via the `.dark` CSS selector (applied by `next-themes`).

**CVA + Radix Slot for UI primitives.** All `ui/` components use Class Variance Authority for variant management and expose an `asChild` prop via `Slot.Root` from `radix-ui` (the unified package) to allow polymorphic rendering. Add `data-slot="<name>"` attribute for styling hooks.

**React 19 patterns.** Do not use `forwardRef`. Pass `ref` as a regular prop. Use `React.ComponentProps<"element">` for prop types.

**QueryClient isolation.** `QueryProvider` creates the client inside `useState` to prevent state sharing across SSR requests.

### Common component usage

```tsx
// Layer 2 — layout wrappers
import { ContentLayout } from "@/components/layout/content-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";

// Layer 3 — composites
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { DataTable } from "@/components/common/data-table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { SearchInput } from "@/components/common/search-input";
import { PaginationControls } from "@/components/common/pagination-controls";

// Hooks
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocalStorage } from "@/hooks/useLocalStorage";
```

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
