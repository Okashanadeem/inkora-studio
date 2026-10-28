# Inkora Studio — Operational Runbook

This document describes how to set up, develop, test, migrate, and maintain the Inkora Studio project locally and in production.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `pnpm` or `npm` (lockfile committed)
- **Supabase CLI**: For local PostgreSQL migrations, schema generation, and RLS testing
- **Git**: Configured with Conventional Commits

---

## 2. Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Okashanadeem/inkora-studio.git
   cd inkora-studio
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and populate values:
   ```bash
   cp .env.example .env.local
   ```

4. **Start Supabase Local Stack** (Optional / Recommended):
   ```bash
   npx supabase start
   npx supabase db reset
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 3. Database Migrations & Type Generation

1. **Create a New Migration**:
   ```bash
   npx supabase migration new <migration_name>
   ```

2. **Apply Local Migrations**:
   ```bash
   npx supabase migration up
   ```

3. **Generate TypeScript Types from DB Schema**:
   ```bash
   npx supabase gen types typescript --local > src/types/database.types.ts
   ```

---

## 4. Testing & Quality Gates

All checks must pass before opening PRs or concluding phases:

- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Linting & Formatting**: `npm run lint` and `npm run format:check`
- **Unit & Integration Tests**: `npm run test` (Vitest)
- **E2E Testing**: `npm run test:e2e` (Playwright)
- **Database RLS Verification**: `npx supabase test db` (pgTAP / SQL tests)

---

## 5. Deployment Procedures

1. **Vercel Deployments**:
   - Preview deployments are triggered automatically on every pull request.
   - Production deployment is triggered when PR is merged to `main`.
2. **Database Migrations on Production**:
   - Run `npx supabase db push` or apply via Supabase CI GitHub Action against the production project.
3. **Database Backup Strategy**:
   - Scheduled pg_dump exports archived to Cloudflare R2 bucket.
