# Inkora Studio — AI Agent & Project Rules (GEMINI.md)

This document contains all mandatory development, architectural, security, design, and execution rules compiled directly from the `Inkora Studio — Master Project Specification`. Every coding session, AI agent, and developer contributing to this repository **must strictly adhere to these rules**.

---

## 1. Golden Rules for AI Coding Agents (Section 0)

1. **Work Phase by Phase (Section 18):**
   - Strictly follow the numbered delivery phases (Phase 0 through Phase 16).
   - Finish and verify a phase's acceptance criteria before proceeding to the next.
   - Do not jump ahead or scaffold speculative code outside the active phase scope.

2. **Zero Hardcoded Secrets or Business Config:**
   - Never hardcode secrets, prices, discount values, WhatsApp numbers, thresholds, or domains.
   - All secrets and environment variables must be managed via `.env` and parsed at startup via `lib/env.ts` with Zod validation.
   - Dynamic business settings (store name, WhatsApp number, shipping fees, risk thresholds) belong in the database `settings` table and must be admin-editable.

3. **Zero Browser Trust (The Server is the Sole Authority):**
   - Never trust prices, subtotals, totals, discounts, eligibility, stock levels, or purchase proofs sent by the browser.
   - Every price and calculation must be recalculated and verified on the server from authoritative catalog data inside transactions.

4. **Row Level Security (RLS) on Every Table:**
   - Every table created in the PostgreSQL `public` schema must have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
   - Every table must have explicit, tested policies for anonymous, customer, staff, and admin roles.
   - RLS is a secondary boundary; server-side authorization checks on Server Actions and Route Handlers are always the primary boundary.

5. **Reusable UI Components First (Section 14):**
   - Build reusable shadcn/ui primitives and shared composite components in `components/shared/` first.
   - No page, module, or route handler may re-implement a button, card, form field, table, modal, or status badge.

6. **Full Production State Discipline:**
   - Every feature must ship with:
     - Strict input validation using Zod.
     - Loading states (using skeletons, never raw generic spinners).
     - Error states and error boundaries.
     - Empty states.
     - Comprehensive unit/integration/E2E tests.

7. **Handling Ambiguity & Decisions:**
   - When a requirement is ambiguous or an `[OPEN]` decision has not been resolved by the client, choose the safest, lowest-friction option.
   - Document the decision in `docs/decisions.md` before continuing.
   - Never guess silently or make breaking assumptions without documenting.

8. **Commit & Documentation Standards:**
   - Commit frequently in small atomic units using Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `refactor:`, `test:`).
   - Keep `docs/` (`architecture.md`, `decisions.md`, `runbook.md`, `env.md`) continuously updated as features are implemented.

9. **Mandatory Phase Progress & Task Tracking:**
   - **Check Progress via `phases/task.md`:** The agent must inspect `phases/task.md` at the start of tasks to identify the current active phase and overall progress.
   - **Immediate Task Checkoff:** As soon as an individual task or acceptance criterion in `phases/phase-xx/task.md` is fully completed and verified, it **must immediately be marked as done (`[x]`)** in that phase's file.
   - **Phase Completion Gate:** Only when **every** task and acceptance criterion in a phase's `task.md` has been completed and verified, mark that phase as completed (`[x]`) in `phases/task.md`.
   - Never skip marking completed tasks.

10. **GitHub, Milestone & Push Rules:**
   - **Milestone & Phase Commits:** Every milestone, major feature, and completed phase must be committed and pushed to GitHub.
   - **Commit Discipline:** Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`). Each commit message should clearly state the phase/milestone context (e.g., `docs(phase-00): initialize project documentation skeleton and phase trackers`).
   - **Push on Phase Completion:** Whenever a phase or significant milestone passes all acceptance criteria, changes must be pushed to the remote repository (`origin`).
   - **Clean Git Working Tree:** Never leave untracked temporary files or unstaged changes after concluding a phase. Maintain clean branch state.

---

## 2. Architectural & Code Organization Rules (Section 4)

- **Monolith Architecture:** Single Next.js (App Router) project with TypeScript strict mode. No separate backend service.
- **Data Mutations vs APIs:**
  - Data mutations must use **Server Actions**.
  - Route Handlers (`src/app/api/...`) are reserved exclusively for webhooks, file upload presigning, and explicit public/external integrations.
- **Directory Layout:**
  - `src/app/(store)`: Public storefront routes (SSR/ISR).
  - `src/app/admin`: Role-protected admin dashboard (never indexed by search engines).
  - `src/app/api`: Webhooks, file presigning/confirmation, subscriptions.
  - `src/components/ui`: shadcn/ui primitives.
  - `src/components/shared`: Reusable business composites (`Price`, `ProductCard`, `DataTable`, `WhatsAppButton`, `FileDropzone`, etc.).
  - `src/modules/*`: Domain business logic (`products`, `orders`, `promotions`, `reviews`, `trends`, `risk`, etc.).
    - Each module must contain: `schema.ts`, `queries.ts`, `service.ts`, `actions.ts`, `types.ts`, `tests/`, and an `index.ts`.
- **Module Boundary Rules:**
  1. Pages contain UI composition only; business rules live strictly in `modules/*/service.ts`.
  2. Database queries live in `queries.ts`; raw queries inside React components are forbidden.
  3. Each module exposes a minimal public API through `index.ts`; modules must not access internal sub-files of other modules.
  4. Environment variables are parsed once in `lib/env.ts` with Zod and must fail fast on invalid or missing variables.
  5. Money rule: Money is stored strictly as integer minor units (paisa) or integer PKR—**never as floating-point numbers**. Use `lib/money` for all formatting and rounding calculations.

---

## 3. Security & Integrity Rules (Section 5)

1. **Authorization on Every Action:**
   - Every Server Action and Route Handler must verify the user's session and role before executing any business logic.
2. **Secrets Stay Server-Side:**
   - Only `NEXT_PUBLIC_*` variables may be exposed to the client bundle.
   - The Supabase `SUPABASE_SERVICE_ROLE_KEY`, Cloudflare R2 credentials, payment gateway keys, and Resend API keys must never be imported into or referenced by client components. A lint rule must enforce this.
3. **Rate Limiting:**
   - Rate limiting must use a shared distributed store (Upstash Redis) rather than in-memory state.
   - Apply strict rate limits to: checkout, login, signup, presigned upload URLs, review submission, coupon attempts, newsletter subscription, and inquiries.
   - Never rely on IP address alone for identity or abuse decisions.
4. **Idempotency Keys:**
   - Mandatory idempotency keys on order creation, checkout submissions, and payment confirmations to prevent duplicate transactions.
5. **Payment Security:**
   - An order is only marked as `payment_status = 'paid'` upon receiving a verified, cryptographically signed webhook or direct provider API confirmation.
   - Webhooks must reject replays and process events idempotently.
6. **File Upload Security:**
   - Artwork must be uploaded to Cloudflare R2 via short-lived presigned PUT URLs with strict content-type and file-size constraints.
   - Customer artwork is stored in a **private bucket**; catalog images live in a public bucket behind a CDN.
   - Server must verify uploaded files (size, magic bytes, dimensions) before recording them in `artwork_files`.
   - Never allow public bucket listing.
7. **Token Security:**
   - All tokens (guest tracking, review invites, subscription confirmation, password reset) must be cryptographically random and stored only as hashes (`token_hash`) with expiration dates and single-use constraints.
   - Never include sensitive personal data (emails, passwords, order details) in URLs.
8. **Security Headers & Defense:**
   - Enforce strict CSP, HSTS, X-Content-Type-Options, Referrer-Policy, and frame restrictions.
   - Cloudflare Turnstile bot protection must be rendered conditionally on risk triggers and sensitive forms.
9. **Audit Trail:**
   - Log all administrative modifications (price adjustments, cancellations, refunds, promotion edits, role updates, review moderation) to the `audit_log` table.

---

## 4. Database & Transactional Rules (Section 6)

1. **Table Standards:**
   - Every table must have: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`.
   - Foreign keys and commonly filtered columns must have indexes.
2. **Review Integrity:**
   - Unique constraint on `reviews.order_item_id`.
   - Only verified buyers can submit reviews; guest purchasers require a single-use token tied to a delivered `order_item_id`.
3. **Promotion Concurrency:**
   - Redemptions must be atomically incremented using a PostgreSQL function or `SELECT ... FOR UPDATE` row locks to prevent race conditions during concurrent checkouts.
4. **Transactional Orders:**
   - Order creation and price recomputations must occur within a single atomic database transaction.

---

## 5. Domain-Specific Business Rules

### Order Status & Fake Order Protection (Section 7)
- **Order State Machine:**
  - Status progression: `draft` → `pending_verification` → `awaiting_payment` → `paid` → `artwork_review` → `proof_sent` → `approved` → `in_production` → `quality_check` → `ready_to_ship` → `shipped` → `delivered` → `completed`.
  - Side states: `on_hold`, `cancelled`, `refunded`, `returned`.
  - Every state transition must be validated by a single state-machine function; invalid jumps are rejected and every transition writes to `order_status_events`.
- **Risk Policy:**
  - Evaluate every order into `low`, `medium`, or `high` risk.
  - High-risk or suspicious bulk orders are held in the admin risk review queue (`pending_verification`); never automatically rejected without review.
  - Production **never** starts until payment confirmation, customer confirmation (for COD/bulk), and artwork approval rules are completely satisfied.

### Promotion Engine (Section 9)
- Offers must be configured via Admin (never hardcoded in code).
- Supported offers: `WELCOME20` (first qualifying order), minimum spend thresholds (e.g., PKR 2,000 spend = 20% off), scheduled sales, coupon codes, and category/product discounts.
- Minimum spend is evaluated against the eligible merchandise subtotal **before shipping** and after item-level discounts.
- Default stacking behavior is **best single offer** unless stacking is explicitly permitted by promotion rules.
- First-order eligibility is validated against historical orders, redemptions, phone, address, and email signals.

### WhatsApp Sales Channel (Section 12)
- Secondary button on every product page: **Ask on WhatsApp**.
- Link format: `https://wa.me/{WHATSAPP_NUMBER}?text={encoded_message}`.
- International format with digits only (no spaces, pluses, or dashes), loaded from admin settings.
- Message includes product title and canonical product URL. Never leak private customer details or artwork links into the WhatsApp URL.
- Log click events in `inquiry_clicks` without persisting message contents.

### Customer Privacy & Marketing Email (Section 13)
- Marketing consent is strictly separate from transactional communications.
- Marketing checkboxes at checkout must be **unchecked by default** and optional.
- Mandatory **double opt-in** workflow for marketing subscriptions (`pending` → confirmation email → `confirmed`).
- One-click unsubscribe in all marketing emails, processed immediately.
- Transactional emails (receipts, proofs, shipping, review invites) must send regardless of marketing subscription status.

### UI/UX & Design Tokens (Section 14)
- Color tokens must be defined via CSS variables for light and dark modes: `--background`, `--foreground`, `--primary` (deep ink blue), `--accent` (vivid magenta/orange), `--muted`, `--border`, `--destructive`.
- All text and button combinations must pass **WCAG 2.2 AA** contrast requirements.
- Core Web Vitals budget: LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-range mobile devices.
- Mobile-first design: Target 360px width viewport first, with thumb-reachable primary actions and sticky Add-to-Cart bar.
- Use `lucide-react` icons exclusively. The flame icon is reserved for the Trending page and badges.

### SEO Requirements (Section 16)
- Server Component rendering (RSC) by default; ISR for catalog, categories, Trending, and blog.
- `generateMetadata` on all public pages with unique titles (~60 chars), meta descriptions (~155 chars), canonical URLs, and Open Graph cards.
- Structured data (JSON-LD) for `Organization`, `WebSite`, `BreadcrumbList`, and `Product` with `Offer`.
- Emit `AggregateRating` and `Review` JSON-LD exclusively from verified, published reviews.
- `robots.ts` must disallow `/admin`, `/api`, `/cart`, `/checkout`, `/account`, and tokenized URLs.

---

## 6. Definition of Done & Quality Gates (Sections 18, 19, 22)

Before any phase is marked complete or code merged:
1. All acceptance criteria for the current phase pass.
2. TypeScript compilation (`tsc --noEmit`) passes with zero errors under strict mode.
3. ESLint and Prettier checks pass with zero warnings/errors.
4. Unit tests (Vitest) pass for all business logic (price calculators, promotions, state machines, money).
5. RLS policies verified with automated database tests.
6. Responsive design verified across viewports: 360px (mobile), 768px (tablet), 1280px (desktop).
7. Documentation updated in `docs/` (`decisions.md`, `architecture.md`, `env.md`, `runbook.md`).
