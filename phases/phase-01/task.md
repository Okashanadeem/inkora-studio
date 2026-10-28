# Phase 1 — Scaffold and design system

## Tasks

- [x] Initialize `create-next-app` with TypeScript strict, App Router, Tailwind, ESLint; add Prettier, Husky, lint-staged, commitlint.
- [x] Initialise shadcn/ui; install the component set from Section 14.3; define design tokens (Section 14.1) and dark mode.
- [x] Build layout shell: header, mobile nav sheet, footer, announcement bar, breadcrumbs, `Container`, `Section`, `PageHeader`.
- [x] Build shared composites that do not need data yet: `Price`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `FormField`, `ConfirmDialog`, `DataTable`.
- [x] Build `/dev/components` gallery, `lib/env.ts`, `lib/money`, error boundaries, 404 and 500 pages.
- [x] Configure GitHub Actions: typecheck, lint, unit tests, build; Vercel preview deployments.

## Acceptance Criteria

- [x] CI green.
- [x] Gallery renders every component at 360px, 768px and 1280px.
- [x] Lighthouse accessibility 95 or higher on shell pages.
