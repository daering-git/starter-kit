# Next.js Starter Kit — Developer Guide

A guide for building new features on top of this starter kit.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Conventions](#conventions)
5. [How to Add a New Page](#how-to-add-a-new-page)
6. [How to Add a UI Component](#how-to-add-a-ui-component)
7. [How to Add a Feature Component](#how-to-add-a-feature-component)
8. [How to Add a shadcn/ui Component via CLI](#how-to-add-a-shadcnui-component-via-cli)
9. [Styling Guide](#styling-guide)
10. [How to Add an API Route](#how-to-add-an-api-route)
11. [How to Add a Provider](#how-to-add-a-provider)
12. [Common Patterns Reference](#common-patterns-reference)

---

## Overview

**Stack:** Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS v4 (CSS-first) + shadcn/ui v4 (Radix UI) + next-themes

**Design principles:**

| Principle | What it means |
|-----------|---------------|
| **Server-first** | Components are Server Components by default. Add `"use client"` only when needed (state, effects, browser APIs). |
| **CSS-first** | No `tailwind.config.js`. All theme tokens live in `globals.css` using `@theme inline`. |
| **Composable UI** | UI primitives in `src/components/ui/` use CVA variants + Radix Slot. Compose them, don't fork them. |

---

## Quick Start

```bash
npm install
npm run dev      # development server → http://localhost:3000
npm run build    # production build + type check
npm run lint     # ESLint
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & routes
│   ├── globals.css         # Tailwind v4 config + theme tokens (OKLCH colors)
│   ├── layout.tsx          # Root layout: fonts, ThemeProvider, Header, Footer
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Card, Badge...)
│   ├── layout/             # Layout components (Header, Footer)
│   └── *.tsx               # Feature-specific components
├── lib/
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
└── providers/
    └── theme-provider.tsx  # Client-side context providers
```

**Decision rule — where does my file go?**

| What you're building | Where to put it |
|----------------------|-----------------|
| New page or route | `src/app/[route]/page.tsx` |
| Reusable UI primitive (button-like, input-like) | `src/components/ui/` |
| Layout piece (nav, sidebar, footer) | `src/components/layout/` |
| Feature component (form, list, modal) | `src/components/` |
| Helper function / util | `src/lib/` |
| Context + Provider | `src/providers/` |

---

## Conventions

### File & Component Naming

| Type | Convention | Example |
|------|-----------|---------|
| Component file | `PascalCase.tsx` | `UserCard.tsx` |
| Utility / hook file | `camelCase.ts` | `useAuth.ts` |
| Page file | `page.tsx` (fixed by Next.js) | `src/app/dashboard/page.tsx` |
| Directory | `kebab-case` | `src/components/user-profile/` |

### Import Alias

Always use `@/*` instead of relative paths.

```typescript
// ✅ correct
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ❌ avoid
import { Button } from "../../components/ui/button";
```

### Server vs Client Components

```typescript
// Server Component (default — no directive needed)
export default function UserList() {
  return <ul>...</ul>;
}

// Client Component — add directive at the top when you need:
// - useState / useReducer
// - useEffect / useRef
// - event handlers (onClick, onChange...)
// - browser-only APIs (localStorage, window...)
"use client";
export function SearchInput() { ... }
```

### TypeScript

Use `React.ComponentProps<"element">` instead of `React.forwardRef`. React 19 passes `ref` as a regular prop.

```typescript
// ✅ React 19 pattern
function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("...", className)} {...props} />;
}

// ❌ no longer needed
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn("...", className)} {...props} />;
});
```

---

## How to Add a New Page

### Basic Page

Create `src/app/[route]/page.tsx`:

```typescript
// src/app/dashboard/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "User dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </div>
  );
}
```

The page is automatically available at `/dashboard`. The root `layout.tsx` (Header + Footer) wraps it automatically.

### Page with URL Parameters

Next.js v15 requires `params` to be awaited:

```typescript
// src/app/users/[id]/page.tsx
type Params = Promise<{ id: string }>;

export default async function UserPage({ params }: { params: Params }) {
  const { id } = await params;   // must await in v15

  return <div>User: {id}</div>;
}
```

### Page with Nested Layout

Add `layout.tsx` inside the route directory to wrap only that section:

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="w-64 border-r">...</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## How to Add a UI Component

Follow the shadcn/ui v4 pattern for all new UI primitives.

**Required elements:**
- `React.ComponentProps<"element">` for props
- `cva()` for variant management
- `Slot.Root` from `"radix-ui"` for `asChild` support
- `data-slot` attribute on the root element
- `cn()` for class merging

### Template

```typescript
// src/components/ui/alert.tsx
import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  // base styles
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="alert"
      data-variant={variant}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Alert, alertVariants };
```

### Compound Component (Card pattern)

When a component has multiple named sub-parts, export them individually:

```typescript
// src/components/ui/panel.tsx
function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel" className={cn("rounded-lg border", className)} {...props} />;
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-header" className={cn("px-4 py-3 border-b", className)} {...props} />;
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-content" className={cn("px-4 py-4", className)} {...props} />;
}

export { Panel, PanelHeader, PanelContent };
```

---

## How to Add a Feature Component

### Server Component (default)

No directive needed. Suitable for static or data-fetched UI:

```typescript
// src/components/user-card.tsx
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserCardProps {
  name: string;
  role: string;
  isActive: boolean;
}

export function UserCard({ name, role, isActive }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>{role}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### Client Component

Add `"use client"` when you need state or event handlers:

```typescript
// src/components/counter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={() => setCount(c => c - 1)}>-</Button>
      <span className="text-2xl font-bold">{count}</span>
      <Button variant="outline" size="icon" onClick={() => setCount(c => c + 1)}>+</Button>
    </div>
  );
}
```

### Preventing Hydration Mismatch

When a component renders differently between server and client (e.g., based on theme, localStorage, time), use the `mounted` pattern:

```typescript
"use client";

import { useState, useEffect } from "react";

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder during SSR to avoid mismatch
  if (!mounted) {
    return <div className="size-9" />;  // same dimensions as the real component
  }

  return <div>client-only content</div>;
}
```

### Data-Driven Rendering

Define data as constants outside the component, then map to JSX:

```typescript
// src/components/feature-list.tsx
import { Check } from "lucide-react";

const FEATURES = [
  { id: 1, label: "Type-safe components" },
  { id: 2, label: "Dark mode support" },
  { id: 3, label: "Accessible by default" },
] as const;

export function FeatureList() {
  return (
    <ul className="space-y-2">
      {FEATURES.map((feature) => (
        <li key={feature.id} className="flex items-center gap-2">
          <Check className="size-4 text-primary" />
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}
```

---

## How to Add a shadcn/ui Component via CLI

`components.json` is already configured. Just run:

```bash
# Add individual components
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add table
npx shadcn@latest add dropdown-menu

# Browse all available components
npx shadcn@latest add
```

Components are generated at `src/components/ui/` following the same v4 patterns already in use.

---

## Styling Guide

### Semantic Color Tokens

Use semantic tokens instead of raw colors. They automatically switch between light/dark mode.

| Token | Light | Dark | Use for |
|-------|-------|------|---------|
| `bg-background` | white | near-black | Page background |
| `text-foreground` | near-black | white | Body text |
| `bg-primary` | dark | white | Primary actions |
| `text-primary-foreground` | white | dark | Text on primary |
| `bg-secondary` | light gray | dark gray | Secondary elements |
| `bg-muted` | light gray | dark gray | Subtle backgrounds |
| `text-muted-foreground` | gray | gray | Secondary text, hints |
| `bg-accent` | light gray | dark gray | Hover states |
| `bg-destructive` | red | red | Errors, delete actions |
| `border-border` | gray | white/10% | Borders |
| `bg-card` | white | dark | Card backgrounds |

### Dark Mode

The `dark:` prefix works automatically — `next-themes` adds the `.dark` class to `<html>`.

```typescript
<div className="bg-background dark:bg-card">
  <p className="text-foreground">
    This text adapts to the current theme.
  </p>
</div>
```

### Adding a Custom Color Token

Edit `src/app/globals.css`:

```css
/* 1. Add to @theme inline block — maps CSS var → Tailwind utility */
@theme inline {
  --color-brand: var(--brand);
}

/* 2. Define values in :root (light) and .dark */
:root {
  --brand: oklch(0.6 0.2 250);   /* blue-ish */
}

.dark {
  --brand: oklch(0.7 0.15 250);  /* lighter in dark mode */
}
```

Now use it as `bg-brand`, `text-brand`, `border-brand`.

### OKLCH Color Format

Colors use `oklch(lightness chroma hue)`:

```
oklch(0.985 0 0)        → near white
oklch(0.145 0 0)        → near black
oklch(0.577 0.245 27)   → red (destructive)
oklch(0.6 0 0 / 50%)    → gray at 50% opacity
```

Tools: [oklch.com](https://oklch.com) for color picking.

---

## How to Add an API Route

Create `src/app/api/[route]/route.ts`:

```typescript
// src/app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const users = [{ id: 1, name: "Alice" }];
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  // process body...
  return NextResponse.json({ created: true }, { status: 201 });
}
```

With dynamic parameters:

```typescript
// src/app/api/users/[id]/route.ts
type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;  // must await in Next.js v15
  return NextResponse.json({ id });
}
```

---

## How to Add a Provider

1. Create the provider in `src/providers/`:

```typescript
// src/providers/auth-provider.tsx
"use client";

import { createContext, useContext, useState } from "react";

interface AuthContextValue {
  user: { name: string } | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  return (
    <AuthContext.Provider value={{ user, signOut: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
```

2. Add it to `src/app/layout.tsx` — wrap inside `ThemeProvider`:

```typescript
// src/app/layout.tsx
import { AuthProvider } from "@/providers/auth-provider";

// inside the JSX:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <AuthProvider>
    <div className="flex min-h-screen flex-col">
      ...
    </div>
  </AuthProvider>
</ThemeProvider>
```

---

## Common Patterns Reference

### `cn()` — Conditional & Merged Classes

```typescript
import { cn } from "@/lib/utils";

// Merge base + conditional + user-provided
<div className={cn(
  "base-class another-class",          // always applied
  isActive && "bg-primary text-white", // conditional
  className                            // allow external override
)} />

// Resolve Tailwind conflicts (tailwind-merge)
cn("px-4 px-8")  // → "px-8"  (last wins)
```

### `Button` as a Link

Use the `asChild` prop to render a `Button` as a Next.js `Link`:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

<Button asChild variant="outline" size="lg">
  <Link href="/signup">Sign Up</Link>
</Button>
```

### Icons with lucide-react

```typescript
import { ArrowRight, Github, Settings } from "lucide-react";

// Size conventions
<ArrowRight className="size-4" />   // small (inside text)
<Settings className="size-5" />     // medium (standalone)
<Github className="size-6" />       // large (hero section)

// Inline with text — gap-2 on parent
<Button className="gap-2">
  Continue <ArrowRight className="size-4" />
</Button>
```

### Card Composition

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Supporting text below the title</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content area</p>
  </CardContent>
  <CardFooter className="border-t">
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Responsive Layout

```typescript
// Mobile-first with Tailwind breakpoints
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  ...
</div>

// Standard container width (matches Header/Footer)
<div className="container mx-auto max-w-screen-2xl px-4">
  ...
</div>
```

---

## Key Reference Files

| Topic | File |
|-------|------|
| Theme tokens (colors, radius) | `src/app/globals.css` |
| UI component pattern | `src/components/ui/button.tsx` |
| Compound component pattern | `src/components/ui/card.tsx` |
| Client component + hydration | `src/components/theme-toggle.tsx` |
| Provider pattern | `src/providers/theme-provider.tsx` |
| Root layout structure | `src/app/layout.tsx` |
| shadcn/ui CLI config | `components.json` |
