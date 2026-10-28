# Phase 1 — Scaffold and design system

## Tasks
- [ ] Initialize `create-next-app` with TypeScript strict, App Router, Tailwind, ESLint; add Prettier, Husky, lint-staged, commitlint.
- [ ] Initialise shadcn/ui; install the component set from Section 14.3; define design tokens (Section 14.1) and dark mode.
- [ ] Build layout shell: header, mobile nav sheet, footer, announcement bar, breadcrumbs, `Container`, `Section`, `PageHeader`.
- [ ] Build shared composites that do not need data yet: `Price`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `FormField`, `ConfirmDialog`, `DataTable`.
- [ ] Build `/dev/components` gallery, `lib/env.ts`, `lib/money`, error boundaries, 404 and 500 pages.
- [ ] Configure GitHub Actions: typecheck, lint, unit tests, build; Vercel preview deployments.

## Acceptance Criteria
- [ ] CI green.
- [ ] Gallery renders every component at 360px, 768px and 1280px.
- [ ] Lighthouse accessibility 95 or higher on shell pages.
