# Inkora Studio — Master Project Specification

*Version 1.0 · 28 October 2026 · Client: Inkora Studio · Audience: AI coding agents (Claude Code, Codex, Gemini CLI) and the Inkora Studio team*

## 0. How to use this document

This is the single source of truth for building the Inkora Studio custom-print e-commerce platform. It was compiled from the full planning conversation plus additions that were missing from it. Every item carries a status tag:

- **\[DECIDED\]** agreed in the planning chat. Do not change without client approval.
- **\[PROPOSED\]** added to complete the system. Implement unless the client objects.
- **\[OPEN\]** needs a client answer. Build behind an abstraction (interface plus feature flag) so either answer works. Do not guess silently.

### Rules for AI coding agents

1. Work **phase by phase** (Section 17). Finish a phase's acceptance criteria before starting the next.
2. Never hard-code secrets, prices, discount values, WhatsApp numbers or domains. Use environment variables or admin-editable settings.
3. **The browser is never trusted.** Prices, totals, discounts, eligibility and purchase verification are computed on the server.
4. Every table in the `public` schema must have **Row Level Security enabled** with explicit policies.
5. Build reusable components first (Section 14). No page may re-implement a button, card, form field or table.
6. Every feature ships with validation (Zod), error states, loading states, empty states and tests.
7. When a requirement is ambiguous, pick the safest option, document it in `docs/decisions.md`, and continue.
8. Commit small, use Conventional Commits, and keep `docs/` updated.

## 1. Project overview

**Business:** Inkora Studio is a custom-print business. Customers browse print products, customise them (upload artwork, choose size, material, quantity), and order.

**Market:** Pakistan (primary). Currency PKR. WhatsApp is a core sales channel. Cash on delivery (COD) is common and carries abuse risk.

**Primary goals**

1. Start at **zero infrastructure cost** and scale only when revenue justifies it. \[DECIDED\]
2. Give customers a simple, trustworthy ordering flow, with guest checkout friction kept low.
3. Protect the business from fake and spam orders. \[DECIDED\]
4. Bring customers back through consented email and useful post-purchase communication. \[DECIDED\]
5. Rank high in search and attract new clients through an SEO-first build. \[DECIDED\]
6. Let non-technical staff run offers, trends, reviews and orders from an admin dashboard without code changes. \[DECIDED\]

**Non-goals for v1:** native mobile apps, multi-vendor marketplace, in-browser design editor (see Section 15 for the v2 path), multi-currency.

## 2. Decision log

| # | Decision | Status |
| --- | --- | --- |
| D1 | Single **Next.js** project (modular monolith), no separate backend | DECIDED |
| D2 | Language: **TypeScript** | DECIDED |
| D3 | Database/Auth: **Supabase** (PostgreSQL, Auth, RLS) | DECIDED |
| D4 | File storage: **Cloudflare R2** (product images, customer artwork) | DECIDED |
| D5 | Hosting: **Vercel** | DECIDED |
| D6 | Mutations via **Server Actions**; **Route Handlers** for webhooks, uploads, explicit APIs | DECIDED |
| D7 | Server-side authorization plus **RLS as second boundary** | DECIDED |
| D8 | Shared rate limiting (no in-memory counters on Vercel) | DECIDED |
| D9 | Order risk policy: low / medium / high with logged reasons and admin review queue | DECIDED |
| D10 | Only verified provider confirmation marks an order paid | DECIDED |
| D11 | Production starts only after payment, customer confirmation and artwork approval rules are met | DECIDED |
| D12 | Marketing consent: optional, unchecked, double opt-in, separate from account and transactional email | DECIDED |
| D13 | Separate `email_subscriptions` table, hashed single-use tokens | DECIDED |
| D14 | Email: Resend for transactional; Brevo evaluated for marketing | DECIDED |
| D15 | Promotion engine: percentage or fixed, first-order, min-spend, scheduled, usage limits, stacking rules, coupon or automatic | DECIDED |
| D16 | Trends page: Best sellers (30-day), Trending now (growth), Popular picks (curated); admin pin/exclude | DECIDED |
| D17 | Reviews only from verified buyers; guests use secure single-use links; moderated | DECIDED |
| D18 | WhatsApp inquiry button with prefilled product link via `wa.me` | DECIDED |
| D19 | Build order: promotions, WhatsApp, reviews, trends | DECIDED |
| D20 | UI kit: **shadcn/ui + Tailwind CSS**, reusable responsive components | DECIDED |
| D21 | Theme and visual identity | PROPOSED (Section 14) |
| D22 | Payment methods (COD, online, both, quotation for bulk) | OPEN |
| D23 | Guest checkout vs account-required vs guest plus optional account | OPEN, default **guest plus optional account** |
| D24 | Online payment gateway for Pakistan | OPEN (candidates: JazzCash, Easypaisa, bank transfer with proof; card gateway TBD) |
| D25 | Courier partners (TCS, Leopards, etc.) | OPEN |
| D26 | Domain name and WhatsApp business number | OPEN |

> **Free-tier reality check \[PROPOSED\]:** verify current terms before launch. Vercel's free Hobby plan is intended for non-commercial use, so a live commercial store may require a paid Vercel plan or an alternative host. Supabase free projects can pause after inactivity and have size limits; plan a backup routine and upgrade path. R2 has a free storage allowance and no egress fees. Treat the zero-cost goal as *start at zero*, not *stay at zero*.

## 3. Technology stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) + React + TypeScript strict | SSR/ISR for SEO |
| UI | Tailwind CSS + **shadcn/ui** + Radix primitives + lucide-react | Reusable components |
| Forms/validation | React Hook Form + **Zod** | One schema shared by client and server |
| Data access | Supabase JS client (SSR helpers); generated DB types | Migrations via Supabase CLI |
| Auth | Supabase Auth (email, optional Google) | Email verification built in |
| Storage | Cloudflare R2 via S3-compatible SDK, **presigned URLs** | Private bucket for artwork, public/CDN bucket for catalog images |
| Rate limiting | Upstash Redis free tier (or Cloudflare rate limiting) | Shared store, not in-memory |
| Bot protection | Cloudflare Turnstile | Shown only on risk triggers and sensitive forms |
| Email | Resend (transactional), Brevo (marketing, later) | Domain SPF/DKIM/DMARC |
| State | Server Components first; TanStack Query for client data; Zustand for cart UI state | Cart persisted server-side for logged-in users |
| Testing | Vitest, Testing Library, Playwright, pgTAP or SQL tests for RLS | CI on every PR |
| Tooling | ESLint, Prettier, Husky, lint-staged, GitHub Actions |  |
| Monitoring | Sentry (free tier), Vercel Analytics, Supabase logs, uptime monitor | \[PROPOSED\] |
| Analytics | Google Analytics 4 or privacy-friendly alternative; Search Console | \[PROPOSED\] |

## 4. Architecture

```
Browser (Next.js UI: storefront, customiser, cart, checkout, admin)
   |  Server Actions / Route Handlers  (validation, authz, business rules)
   v
Next.js server on Vercel
   |-- Supabase (Postgres + Auth + RLS)
   |-- Cloudflare R2 (presigned upload/download)
   |-- Resend / Brevo (email)
   |-- Payment provider (signed webhooks)
   |-- Upstash Redis (rate limits, idempotency cache)
```

One codebase does **not** mean the frontend can reach everything. Credentials stay server-only; the service-role key is used only in server modules and never imported into client components.

### 4.1 Folder structure \[DECIDED, extended\]

```
src/
├── app/
│   ├── (store)/                 # public storefront
│   │   ├── page.tsx             # home
│   │   ├── products/            # listing + [slug]
│   │   ├── categories/[slug]/
│   │   ├── trending/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── order/[token]/       # guest order tracking
│   │   ├── review/[token]/      # guest verified-purchase review
│   │   ├── account/
│   │   ├── blog/                # SEO content
│   │   └── (legal)/             # privacy, terms, refund, shipping
│   ├── admin/                   # dashboard (role-protected)
│   ├── api/
│   │   ├── webhooks/            # payments, email events
│   │   ├── uploads/             # presign + confirm
│   │   └── subscribe/confirm/
│   ├── sitemap.ts · robots.ts · manifest.ts
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── shared/                  # DataTable, PageHeader, EmptyState, Price, Rating...
│   ├── products/ customization/ checkout/ marketing/ admin/
├── modules/                     # business logic, one folder per domain
│   ├── products/ orders/ customers/ payments/ fulfillment/
│   ├── promotions/ reviews/ trends/ subscriptions/ inquiries/ risk/
│   └── (each: schema.ts, queries.ts, service.ts, actions.ts, types.ts, tests/)
├── lib/
│   ├── supabase/ r2/ auth/ validation/ email/ ratelimit/ seo/ money/ env.ts
└── types/
supabase/migrations/ · docs/ · e2e/
```

**Module rules**

1. Pages contain composition only. Business rules live in `modules/*/service.ts`.
2. Database queries live in `queries.ts`; no raw queries in components.
3. Each module exposes a small public API through its `index.ts`; modules do not reach into each other's internals.
4. Environment variables are parsed once in `lib/env.ts` with Zod and fail fast on startup.
5. Money is stored as **integer minor units** (paisa) or integer PKR, never floats. One helper `lib/money` formats and rounds everything.

## 5. Security principles \[DECIDED, extended\]

1. **Server is the authority.** Recalculate price, quantity, stock, discount and totals on the server from catalog data. Ignore any price sent by the browser.
2. **Authorization on every action.** Each Server Action and Route Handler checks the session and role first.
3. **RLS everywhere.** Customers read only their own rows; admin access through role claims; anonymous access limited to published catalog data. RLS is a second boundary, never the only one.
4. **Secrets stay server-side.** Only `NEXT_PUBLIC_*` values reach the browser; service-role, R2, payment and email keys never do.
5. **Validate every input** with Zod at the boundary, including file metadata, and escape or sanitise all rendered user text (reviews, names, notes).
6. **Rate limit** checkout, login, signup, upload presign, review submit, coupon attempts, subscribe, and inquiry endpoints using a shared store. IP alone is never the only signal.
7. **Idempotency keys** on order creation and payment confirmation to stop duplicate submissions.
8. **Payments:** an order becomes paid only after a signed webhook or verified provider API response. Verify signatures, reject replays, handle events idempotently.
9. **Uploads:** presigned URLs with short expiry, size and content-type limits, magic-byte verification after upload, randomised object keys, private bucket for artwork, optional malware scan hook, no public listing.
10. **Tokens** (verification, review, guest order tracking) are cryptographically random, stored hashed, expiring and single-use where applicable. No personal data in URLs.
11. **Security headers:** strict CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame protection; CSRF safe by using Server Actions or same-site cookies with origin checks.
12. **Audit log** for admin actions (price change, order cancel, refund, promotion edit, role change, review moderation).
13. **Admin hardening:** separate role table, optional 2FA for admins, session timeout, no admin routes indexed.
14. **Privacy:** collect the minimum, define retention for artwork and abandoned drafts, provide data export and deletion on request, keep consent records.
15. **Dependency hygiene:** lockfile, Dependabot or Renovate, `npm audit` in CI, secret scanning.
16. **Backups:** scheduled database export to R2 (free tier has limited backups) and a documented restore drill.

## 6. Data model

All tables: `id uuid pk`, `created_at`, `updated_at`; RLS on; indexes on foreign keys and common filters.

**Catalog**

- `categories` (name, slug, parent\_id, image, sort, is\_active, seo\_title, seo\_description)
- `products` (name, slug, description, category\_id, base\_price, status draft/published/archived, is\_customizable, seo fields, search vector)
- `product_images` (product\_id, r2\_key, alt, sort)
- `product_options` and `option_values` (size, material, finish, with price modifiers)
- `product_variants` (sku, option combination, price, stock, is\_active)
- `price_tiers` (product\_id, min\_qty, unit\_price) for bulk pricing

**Customers and auth**

- `profiles` (user\_id, full\_name, phone, phone\_verified\_at)
- `addresses` (user\_id, label, line1, city, province, postal\_code, country)
- `user_roles` (user\_id, role: customer, staff, admin)

**Cart and orders**

- `carts` and `cart_items` (server-side for logged-in users; signed cookie for guests; draft separate from submitted orders; stale drafts expire)
- `orders` (order\_number, user\_id nullable, guest\_email, guest\_phone, status, payment\_status, payment\_method, subtotal, discount\_total, shipping\_total, tax\_total, grand\_total, risk\_level, risk\_reasons jsonb, idempotency\_key unique, tracking\_token\_hash)
- `order_items` (order\_id, product\_id, variant\_id, name\_snapshot, unit\_price\_snapshot, quantity, options\_snapshot jsonb)
- `order_status_events` (order\_id, from, to, actor, note)
- `payments` (order\_id, provider, provider\_ref, amount, status, raw\_event jsonb)
- `shipments` (order\_id, courier, tracking\_no, status)
- `artwork_files` (order\_item\_id, r2\_key, mime, size, width, height, dpi, status uploaded/verified/rejected/approved, approved\_by, approved\_at)
- `proofs` (order\_item\_id, r2\_key, status sent/approved/changes\_requested)

**Promotions**

- `promotions` (name, type percentage/fixed, value, max\_discount, min\_spend, audience all/first\_order/group, applies\_to all/categories/products, starts\_at, ends\_at, is\_active, is\_automatic, coupon\_code nullable unique, usage\_limit\_total, usage\_limit\_per\_customer, stackable bool, priority)
- `promotion_targets` (promotion\_id, category\_id or product\_id)
- `promotion_redemptions` (promotion\_id, order\_id, user\_id or email\_hash, amount, created\_at)

**Reviews, trends, marketing, inquiries**

- `reviews` (product\_id, order\_item\_id unique, user\_id nullable, author\_name, rating 1-5, title, body, status pending/published/rejected, verified\_purchase bool, admin\_reply)
- `review_invites` (order\_item\_id, token\_hash, expires\_at, used\_at)
- `product_stats_daily` (product\_id, date, views, add\_to\_carts, units\_sold, cancelled\_units)
- `trend_overrides` (product\_id, pinned bool, excluded bool, position, starts\_at, ends\_at, label)
- `email_subscriptions` (email unique, status pending/confirmed/unsubscribed, consent\_source, consented\_at, confirmed\_at, unsubscribed\_at)
- `subscription_tokens` (subscription\_id, token\_hash, expires\_at, consumed\_at)
- `consent_events` (email, action, source, ip\_hash, user\_agent, at)
- `inquiry_clicks` (product\_id, source, created\_at) with no message content stored

**Operations**

- `settings` (key, value jsonb: WhatsApp number, store name, shipping rules, thresholds)
- `risk_events` (subject, signal, score, decision, order\_id)
- `audit_log` (actor\_id, action, entity, entity\_id, diff jsonb, at)
- `idempotency_keys` (key, scope, response\_hash, expires\_at)

**Required DB behaviours:** unique constraint on `reviews.order_item_id`; atomic redemption increment through a Postgres function or `SELECT ... FOR UPDATE` so concurrent checkouts cannot exceed limits; order totals recomputed inside a transaction; materialised view or scheduled job to fill `product_stats_daily`.

## 7. Best flow: browse to delivered order

The recommended customer journey, optimised for low friction and low abuse:

1. **Discover:** landing page, category, search, Trending page, blog or Google result.
2. **Evaluate:** product page with gallery, option picker, live price, tier pricing, reviews, FAQ, delivery estimate, **Ask on WhatsApp** button.
3. **Customise:** choose size, material, finish, quantity; upload artwork (or describe the design). Live validation of file type, size and resolution warnings.
4. **Cart:** editable lines, automatic promotion preview, clear subtotal, free-shipping progress bar if applicable.
5. **Checkout (single page, 3 clear sections):** contact (email, phone), delivery address, payment method. Guest checkout allowed with optional account creation after the order. Marketing checkbox unchecked by default.
6. **Server validation:** recompute prices, apply promotions, check stock, run risk checks, create order inside one transaction with an idempotency key.
7. **Payment or confirmation:** online payment goes to the provider; COD or bulk orders go through phone or WhatsApp confirmation depending on risk level.
8. **Artwork review:** staff verify artwork quality; send a proof for approval where the product needs it.
9. **Production:** starts only when payment, confirmation and artwork approval rules are satisfied.
10. **Dispatch and tracking:** courier tracking number, email and optional WhatsApp updates, guest tracking page via secure token link.
11. **After delivery:** review invitation, reorder link, relevant product suggestions (only to consented subscribers for marketing content).

### 7.1 Order status model \[PROPOSED\]

`draft` > `pending_verification` (risk hold or COD confirm) > `awaiting_payment` > `paid` > `artwork_review` > `proof_sent` > `approved` > `in_production` > `quality_check` > `ready_to_ship` > `shipped` > `delivered` > `completed`. Side states: `on_hold`, `cancelled`, `refunded`, `returned`. Every transition writes to `order_status_events`. Transitions are validated by one state-machine function; invalid jumps are rejected.

### 7.2 Fake-order and abuse protection \[DECIDED\]

Goal: make order creation cheap to attempt but expensive to abuse, without hurting genuine customers.

| Order type | Protection |
| --- | --- |
| Standard | Rate limit, server validation, duplicate detection, verified payment before marking paid |
| Bulk (quantity or value above admin-set threshold) | Require verification or manual confirmation before production; never auto-reject |
| Repeated suspicious | Progressive friction: Turnstile, email or phone OTP, cooldown, manual review |

| Threat | Control |
| --- | --- |
| Bots creating hundreds of orders | Rate limiting plus Turnstile when activity looks suspicious |
| One person submitting many orders fast | Per-user, per-IP and per-phone limits; cooldown windows |
| Fake bulk order | Quantity and value thresholds; manual confirmation |
| Double submit | Idempotency key plus duplicate-order check |
| Customer claims they paid | Signed webhook or provider API verification only |
| COD order never accepted | Phone confirmation (WhatsApp or call) before production or dispatch |
| Abandoned checkout clutter | Drafts kept separate from submitted orders; expire stale drafts |
| Price tampering | All prices computed server-side |
| First-order offer farming | Eligibility by order history, phone, address and email signals; rate limits |

**Risk policy (initial rules, all thresholds admin-editable in `settings`):**

- **Low risk:** normal volume and valid details. No extra friction.
- **Medium risk:** repeated submissions, unusual quantity, uncertain contact details, new account plus large COD order. Require verification or confirmation.
- **High risk:** clear automation, repeated abuse, confirmed fraud. Temporarily block or hold for admin review.

Signals are combined into a score; no single signal proves fraud. IP addresses are **not** reliable identity, because shared networks exist and attackers rotate IPs. Every hold or block stores its reason in `risk_reasons` so an admin can review it. Admin review queue shows order details, reasons, customer verification status, and Approve / Request verification / Cancel actions.

**COD-specific rules \[PROPOSED\]:** phone OTP or WhatsApp confirmation for first-time COD buyers; optional partial advance payment for high-value or bulk COD; blocklist of phone numbers and addresses with repeated refused deliveries; maximum COD value for new customers.

## 8. Payments and checkout \[OPEN: D22, D23, D24\]

The payment method was asked but not answered in the chat. Implement a **payment-provider abstraction** so the final choice does not change core code:

```ts
interface PaymentProvider {
  id: string;
  createPayment(order: Order): Promise<PaymentIntent>;
  verifyWebhook(req: Request): Promise<VerifiedEvent>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
}
```

Supported methods behind feature flags: `cod`, `online` (gateway TBD), `bank_transfer` (customer uploads proof; admin verifies), `quotation` (bulk or custom orders handled manually). Default launch configuration if the client does not decide: **guest checkout plus optional account, COD with phone confirmation, bank transfer with proof, bulk orders by quotation or manual confirmation.**

Rules that apply to all methods: only verified confirmation sets `payment_status = paid`; webhooks are signed, idempotent and logged; refunds and cancellations are admin actions written to the audit log.

## 9. Promotion engine \[DECIDED\]

One reusable rules engine powers every offer: first-order discount, minimum-spend discount, scheduled sale, coupon code, category or product offers.

### 9.1 Rule fields

| Rule | Example |
| --- | --- |
| Discount type | Percentage or fixed PKR amount |
| Eligibility | First qualifying order, all customers, selected customer group |
| Minimum spend | PKR 2,000 eligible subtotal |
| Discount cap | Maximum PKR 500 off |
| Scope | All products, selected categories or items |
| Usage limits | Total redemptions, per-customer limit |
| Schedule | Start, end, active or paused |
| Application | Automatic or coupon code |
| Stacking | Not stackable (default) or explicitly allowed combinations, plus priority |

### 9.2 Required examples (must be configurable from admin, not hard-coded)

- **WELCOME20:** 20% off the first qualifying order.
- **Spend PKR 2,000, save 20%:** automatic when the eligible subtotal reaches the threshold.
- **Weekend print sale:** active only between configured dates.

**Threshold definition:** the eligible merchandise subtotal **before shipping**, after item-level discounts. Whether tax counts toward the threshold follows local tax rules and is a setting. Example: eligible subtotal PKR 2,500 with 20% gives PKR 500 off, leaving PKR 2,000 before shipping and taxes.

### 9.3 Engine behaviour

1. Input: cart lines, customer identity (user or guest contact), coupon code, current time.
2. Load active promotions; filter by schedule, scope, audience, usage limits.
3. Compute each candidate discount; apply the cap; resolve stacking by priority; default is **best single offer** unless stacking is explicitly allowed.
4. Return a breakdown: lines, discount per promotion, explanation text for the UI (why it applied or why it did not).
5. At order creation, re-run the engine and **atomically** record the redemption (database function with row lock) so concurrent checkouts cannot exceed limits.
6. Redemptions are reversed on cancellation or refund according to a setting.

**First-order eligibility** is checked against order history and redemption records, not only whether the account is new. Combine with phone, address and email signals, rate limits and risk checks, because first-order offers invite fake-account abuse. Coupon attempts are rate limited and failures are generic (do not reveal whether a code exists).

### 9.4 Admin: Marketing > Promotions

List with status filters; create and edit form (name, type, value, minimum spend, cap, audience, scope picker, dates, code, stacking, limits); live preview card matching the storefront; pause or resume; duplicate; redemption report (count, revenue, discount given); audit trail for every edit. Storefront shows promotion banners and cart messages such as Add PKR 300 more to unlock 20% off.

## 10. Verified-purchase reviews \[DECIDED\]

**Principle:** only customers with a qualifying purchase may review a product. Requiring a full account is unnecessary friction, so guests review through secure links.

**Flow**

1. Order item is recorded on purchase.
2. After `delivered`, a scheduled job sends an optional review invitation (a transactional message, independent of marketing consent). Invitation timing is configurable (default several days after delivery).
3. Logged-in customers: the server checks the authenticated user owns the order item.
4. Guests: single-use, hashed, expiring review token tied to one order item.
5. Submit: rating 1 to 5, optional title and text, optional photo (stored in R2, moderated).
6. Moderation: reviews enter `pending`; admin publishes or rejects against a written policy.
7. Published reviews show a **Verified purchase** badge only when the backend confirmed eligibility.

**Rules**

- Never trust product or order IDs sent by the browser as proof of purchase.
- One review per order item (`unique(order_item_id)`); edit window defined in settings.
- Do not delete legitimate negative reviews. Do not gate invitations on expected positive ratings.
- Average rating and count use **published** reviews only.
- Sanitise all review text; rate limit submission; profanity and spam heuristics feed moderation, not silent deletion.
- Admin can reply publicly; customers can be notified of replies.
- Emit `AggregateRating` and `Review` JSON-LD only from real published reviews (Section 16).

## 11. Trending and best-seller page \[DECIDED\]

Route `/trending`, with a restrained flame icon.

| Section | Logic |
| --- | --- |
| **Best sellers** | Completed units sold in a rolling 30-day window, excluding cancelled and returned |
| **Trending now** | Recent-period sales (for example last 7 days) compared with the previous period, requiring a minimum activity threshold so one sale on a low-volume item cannot fake growth |
| **Popular picks** | Curated by admin or supported by meaningful customer interest |

**Ranking signals:** completed item quantity (primary), recent sales growth, product views, add-to-cart events, returns and cancellations (penalty). Views and add-to-cart show interest, not purchases, so they weigh less than completed sales.

**Admin (Catalog > Trends):** pin products, exclude items (unavailable, out of stock), set campaign dates, override automatic order, choose windows. Paid or promoted placements must be clearly labelled and never presented as organic ranking. Stats come from `product_stats_daily`, filled by a scheduled job (Vercel Cron or Supabase scheduled function). Until enough sales exist, fall back to curated picks so the page is never empty. The page uses ISR with a short revalidation window for speed and SEO.

## 12. WhatsApp inquiry \[DECIDED\]

Button label: **Ask on WhatsApp**, placed beside Add to cart as a secondary button on every product page (and optionally cart and checkout help links).

```ts
const message = [
  `Hi, I'm interested in ${product.name}.`,
  `Product link: ${productUrl}`,
  'Could you tell me more about the customization options?'
].join('\n');
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
```

- `WHATSAPP_NUMBER`: business number in international format, digits only (no plus, spaces or hyphens). Stored in admin Settings > WhatsApp (OPEN: D26).
- `productUrl` is built from the trusted canonical site URL plus the product slug, never from visitor-supplied URLs.
- It is a plain link; the customer reviews and sends the message. Nothing is sent automatically.
- Optionally append the currently selected size and quantity from the form. Never put artwork or private order data into the URL.
- Track clicks in `inquiry_clicks` without storing message content. Default message template is editable in admin.
- Add a floating WhatsApp help button on mobile (small, non-blocking) \[PROPOSED\].

## 13. Customer retention and email \[DECIDED\]

**Principle:** marketing consent is separate from accounts and from order notifications.

**Checkout checkbox copy:** *Email me about new products, offers and updates. I can unsubscribe at any time.* Unchecked by default; never required to order.

**Double opt-in flow**

1. Customer ticks the box (checkout, footer form or account settings) and provides an email.
2. Server creates a `pending` subscription and a cryptographically secure, single-use token; only the **hash** is stored, with an expiry.
3. Resend sends Confirm your subscription to Inkora Studio.
4. Link click: server validates token, expiry and pending state, then sets `confirmed`.
5. Unconfirmed subscriptions never receive campaigns and expire after a reasonable period.
6. Every marketing email has a one-click unsubscribe link; unsubscribe takes effect immediately.

Record consent time and source in `consent_events`. Do not put emails or personal data in verification URLs. Local privacy and e-marketing laws vary by country, so confirm requirements for markets served.

**Keep separate:** transactional emails (order confirmation, receipt, production and delivery updates, review invitation, password reset) are sent regardless of marketing consent.

**Email templates \[PROPOSED\]:** order confirmed, payment received, artwork needs attention, proof ready, shipped with tracking, delivered plus review invite, subscription confirm, welcome, back-in-stock, new product launch (consented only). Build with React Email, shared layout, plain-text fallback, SPF/DKIM/DMARC configured on the sending domain.

**Return-customer tactics:** reorder button using saved specifications, saved addresses, post-delivery cross-sell, seasonal campaigns (gifts, events, festivals), segment by purchase history, birthday or anniversary offers only with explicit data consent, abandoned cart reminder to consenting logged-in users, and WhatsApp follow-up for bulk customers via the business number.

## 14. UI/UX design system

### 14.1 Visual identity \[PROPOSED, D21\]

The chat did not fix a theme, so use this default and keep every value in design tokens so the client can re-skin without touching components.

- **Personality:** creative, clean, premium-but-approachable print studio. The product and the customer's artwork are the heroes; the UI stays quiet.
- **Colour tokens (CSS variables, light and dark):** `--background` warm off-white, `--foreground` near-black ink, `--primary` deep ink blue or indigo, `--accent` vivid magenta or orange used sparingly for offers and the flame icon, `--muted`, `--border`, `--success`, `--warning`, `--destructive`. Check all text and button pairs for WCAG AA contrast (4.5:1 text, 3:1 large text and UI).
- **Typography:** one display face for headings and one highly legible sans for body via `next/font` (self-hosted, no layout shift); fluid type scale with `clamp()`.
- **Shape and spacing:** 8px spacing grid, consistent radius token, soft shadows, 12-column container with max width.
- **Imagery:** real product photography, consistent aspect ratios (for example 4:5 cards), WebP or AVIF, explicit width and height, lazy loading except the LCP image.
- **Iconography:** lucide-react only. Flame icon reserved for the Trending page and badges.
- **Dark mode:** supported through tokens (`next-themes`), default follows system.

### 14.2 UX principles

1. **Mobile first.** Most traffic will be phones. Design at 360px first; thumb-reachable primary actions; sticky Add to cart bar on product pages.
2. **Few steps, clear progress.** Single-page checkout with visible summary; no forced account.
3. **Clarity of price.** Live price updates with options; show what the discount does; no surprise costs at the last step.
4. **Trust at every step:** reviews with Verified purchase badge, clear delivery and return policy, secure-payment cues, real contact and WhatsApp options.
5. **Forgiving forms:** inline validation on blur, specific messages, preserved input, autofill attributes, numeric keypad for phone and quantity, input masks only where helpful.
6. **Feedback and states:** every async action has loading, success, error and empty states; optimistic UI only where safe; toasts for confirmations; skeletons rather than spinners for content.
7. **Accessibility (WCAG 2.2 AA):** semantic HTML, visible focus rings, keyboard operable everywhere, Radix primitives for dialogs and menus, labelled inputs, alt text, reduced-motion support, minimum 44px touch targets.
8. **Performance as UX:** Core Web Vitals budget: LCP under 2.5s, INP under 200ms, CLS under 0.1 on mid-range mobile.
9. **Progressive disclosure:** keep the product page focused; put specs, FAQs and file guidelines in tabs or accordions.
10. **Consistency:** one component for each job; same wording for the same action; same layout patterns across admin pages.
11. **Language \[PROPOSED\]:** English at launch; architecture ready for Urdu with RTL support (`next-intl`, logical CSS properties) when the client wants it.

### 14.3 Reusable component inventory (shadcn/ui)

Install these shadcn components first: `button`, `input`, `textarea`, `label`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `form`, `dialog`, `sheet`, `drawer`, `dropdown-menu`, `popover`, `tooltip`, `tabs`, `accordion`, `card`, `badge`, `avatar`, `table`, `pagination`, `breadcrumb`, `navigation-menu`, `command`, `calendar`, `date-picker`, `progress`, `skeleton`, `sonner` (toasts), `alert`, `alert-dialog`, `separator`, `scroll-area`, `carousel`, `sidebar`, `chart`.

Build these **shared composites** on top (in `components/shared`), each responsive, typed, documented and tested:

| Component | Purpose |
| --- | --- |
| `Container`, `Section`, `PageHeader` | Layout rhythm, consistent spacing and headings |
| `ProductCard`, `ProductGrid` | Image, name, price, rating, badges (Trending, Sale), quick actions |
| `Price`, `DiscountBadge` | One formatter for PKR, strikethrough, savings text |
| `RatingStars`, `ReviewCard`, `ReviewForm`, `RatingSummary` | Reviews with Verified purchase badge |
| `OptionPicker` (size, material, finish) | Customisation choices with price impact |
| `QuantityStepper`, `TierPriceTable` | Quantity and bulk pricing |
| `FileDropzone` | Artwork upload with progress, validation, preview, retry |
| `CartDrawer`, `CartLine`, `OrderSummary`, `PromoCodeInput` | Cart and checkout summary |
| `AddressForm`, `ContactForm`, `PaymentMethodSelector` | Checkout sections |
| `WhatsAppButton` | Prefilled inquiry link (Section 12) |
| `MarketingConsentCheckbox`, `NewsletterForm` | Consented subscription UI |
| `PromoBanner`, `ProgressToOffer` | Offer messaging |
| `StatusBadge`, `OrderTimeline` | Order and production progress |
| `EmptyState`, `ErrorState`, `LoadingSkeleton` | Consistent states |
| `DataTable` (sort, filter, paginate, bulk actions, column toggle) | All admin lists |
| `FormField` wrappers with RHF and Zod | Every form |
| `ConfirmDialog` | Destructive actions |
| `StatCard`, `ChartCard` | Admin analytics |
| `SEO` helpers (`JsonLd`, metadata builders) | Structured data |

**Component rules:** accept `className`; use `cva` variants; no hard-coded colours (tokens only); responsive by default with container queries where useful; accessible by default; a Storybook or `/dev/components` gallery page (admin-only) documents each one; unit test the logic, Playwright the flows.

## 15. Product customisation and artwork pipeline \[PROPOSED\]

Custom printing needs more than a normal cart:

1. **Per-product customisation schema:** each customisable product defines required fields (size, material, finish, text, colours, file slots). Validated by Zod on client and server.
2. **Upload flow:** client requests a presigned PUT URL from `/api/uploads/presign` (auth or guest-token, rate limited) with declared name, type, size; server checks the allow-list (PNG, JPG, PDF, SVG, AI/PSD optional), size cap, quotas; browser uploads straight to R2; client calls confirm; server verifies the object (size, magic bytes, dimensions), writes `artwork_files`.
3. **Quality checks:** warn on low resolution versus chosen print size; show effective DPI; accept anyway with a warning if the customer insists.
4. **Storage layout:** `artwork/{yyyy}/{mm}/{random-id}` in a private bucket; catalogue images in a separate public bucket behind the Cloudflare CDN; download for staff through short-lived signed URLs only; retention policy deletes artwork after an admin-set period.
5. **Proof approval:** staff upload a proof; customer approves or requests changes via secure link or account; approval timestamp stored; production unlocks only after approval where the product requires it.
6. **Preview (v1):** show uploaded artwork on a simple product mockup (CSS or canvas overlay). A full in-browser design editor is a v2 feature.
7. **Free-tier discipline:** compress images client-side before upload where safe; set storage lifecycle rules; monitor R2 usage against free limits.

## 16. SEO strategy (attracting new clients) \[DECIDED goal, details PROPOSED\]

**Technical SEO**

- Server-render all public pages (RSC), ISR for catalogue, categories, Trending and blog; static where possible.
- `generateMetadata` on every page: unique title (about 60 chars), meta description (about 155 chars), canonical URL, Open Graph and Twitter cards with generated OG images (`next/og`).
- `app/sitemap.ts` (products, categories, blog, static pages) and `app/robots.ts` (block `/admin`, `/api`, `/cart`, `/checkout`, `/account`, tokenised URLs; point to sitemap). Add `noindex` to checkout, account, order tracking and review-token pages.
- Clean slugs: `/products/custom-art-print`, `/categories/business-cards`. 301 redirects when a slug changes; handle faceted or filtered URLs with canonicals to avoid duplicates.
- Structured data (JSON-LD): `Organization`, `WebSite` with SearchAction, `BreadcrumbList`, `Product` with `Offer` (price, currency PKR, availability) and `AggregateRating` plus `Review` only from real published reviews, `FAQPage` where genuine FAQs exist, `LocalBusiness` if a physical location exists. Validate with Google Rich Results Test. Rich results are never guaranteed.
- Performance: `next/image` with AVIF or WebP, correct `sizes`, priority only on the LCP image, `next/font`, minimal client JS, no layout shift, third-party scripts deferred.
- International and local: `lang` attribute, `hreflang` when Urdu is added, Pakistan targeting in Search Console, Google Business Profile if applicable.
- Accessibility and mobile-friendliness double as ranking and conversion signals.

**Content SEO**

- Product pages: unique descriptions (not copied from suppliers), specs, sizes, materials, turnaround, FAQ, gallery with descriptive alt text, reviews, related products.
- Category pages with intro copy and internal links.
- **Blog and guides** targeting buyer-intent searches: how to prepare print-ready artwork, paper stock comparisons, business card sizes, event printing checklists, custom gift ideas by occasion. Interlink guides to products.
- Landing pages for high-intent queries (custom t-shirt printing, wedding cards, corporate gifts, bulk printing quotes) and city or area pages only where genuinely useful.
- Portfolio or case-study page showing real work (with client permission).
- About, Contact, FAQ, Shipping, Returns, Privacy, Terms pages for trust and E-E-A-T.

**Measurement and growth**

- Google Search Console and Bing Webmaster verified at launch; submit sitemap.
- Analytics with events: view\_item, add\_to\_cart, begin\_checkout, purchase, inquiry\_click (WhatsApp), subscribe.
- Monthly review of queries, Core Web Vitals and indexing; keep a keyword map in `docs/seo-keywords.md`.
- Social sharing and WhatsApp-friendly previews through Open Graph; Instagram and Pinterest profiles linking back; Google Merchant Center product feed \[PROPOSED\].

## 17. Admin dashboard \[DECIDED, extended\]

Role-protected `/admin` (roles: admin, staff). Sections:

- **Dashboard:** orders today, revenue, pending verification, awaiting artwork, low stock, top products, recent reviews.
- **Orders:** filters by status and risk; detail with timeline, artwork viewer, proof upload, status transitions, notes, refund or cancel, print-friendly job sheet.
- **Risk review queue:** held orders with reasons and Approve, Verify, Cancel actions.
- **Catalog:** products, variants, options, price tiers, categories, images, SEO fields, publish state; bulk import and export (CSV).
- **Marketing > Promotions** (Section 9), **Subscribers and Campaigns**, **Coupons report**.
- **Catalog > Trends** (Section 11).
- **Reviews:** moderation queue, verified status, replies.
- **Customers:** profile, order history, notes, blocklist flag.
- **Inquiries:** WhatsApp click analytics.
- **Settings:** store details, WhatsApp number and template, shipping rules, risk thresholds, tax, email templates, payment methods, staff roles.
- **Audit log** viewer.

## 18. Delivery phases

*(Section 0 refers to the phases by this section; the phase list below is the build order.)* Each phase lists tasks and **acceptance criteria**. A phase is complete only when all criteria pass, tests are green, and `docs/` is updated. The order of the feature phases 8 to 11 follows the client's decided build order: promotions, WhatsApp, reviews, trends.

### Phase 0 — Discovery and accounts

- Create accounts: GitHub, Vercel, Supabase (separate dev and prod projects), Cloudflare (R2, DNS, Turnstile), Resend, Upstash, Sentry.
- Confirm OPEN items D22 to D26 with the client; record answers in `docs/decisions.md`.
- Collect brand assets: logo, colours, fonts, product list, sample photography, policy text, WhatsApp number, domain.
- Write `docs/` skeleton: architecture, decisions, runbook, env reference.
- **Accept:** all accounts exist, secrets stored in a password manager, decision log updated.

### Phase 1 — Scaffold and design system

- `create-next-app` with TypeScript strict, App Router, Tailwind, ESLint; add Prettier, Husky, lint-staged, commitlint.
- Initialise shadcn/ui; install the component set from 14.3; define design tokens (14.1) and dark mode.
- Build layout shell: header, mobile nav sheet, footer, announcement bar, breadcrumbs, `Container`, `Section`, `PageHeader`.
- Build shared composites that do not need data yet: `Price`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `FormField`, `ConfirmDialog`, `DataTable`.
- `/dev/components` gallery, `lib/env.ts`, `lib/money`, error boundaries, 404 and 500 pages.
- GitHub Actions: typecheck, lint, unit tests, build; Vercel preview deployments.
- **Accept:** CI green; gallery renders every component at 360px, 768px and 1280px; Lighthouse accessibility 95 or higher on shell pages.

### Phase 2 — Database, auth and RLS

- Supabase CLI migrations for the data model in Section 6; generated TypeScript types.
- Enable RLS on every table with explicit policies; seed script for development.
- Auth: email and password plus optional Google; email verification; password reset; SSR session helpers; middleware for protected routes.
- `user_roles`, admin guard helper, audit log helper, idempotency helper.
- RLS tests (pgTAP or SQL tests): anonymous, customer, staff and admin cases for each table.
- **Accept:** a customer cannot read another customer's rows; anonymous users see only published catalogue data; service-role key is only imported in server modules (lint rule enforces it).

### Phase 3 — Catalogue and admin product management

- Admin layout with sidebar; DataTable lists.
- CRUD for categories, products, options, variants, price tiers, images (upload to the public R2 bucket through presigned URLs).
- Draft and published states, SEO fields, slug generation and uniqueness, CSV import and export.
- **Accept:** staff can create a customisable product with options and tiers without code; unpublished products never appear publicly.

### Phase 4 — Storefront and SEO foundation

- Pages: home, category, product listing with filters and search (Postgres full-text), product detail, static pages, 404.
- `ProductCard`, `ProductGrid`, `OptionPicker`, `QuantityStepper`, `TierPriceTable`, gallery, breadcrumbs, related products.
- Metadata, canonical URLs, Open Graph images, `sitemap.ts`, `robots.ts`, JSON-LD for Organization, WebSite, BreadcrumbList, Product and Offer.
- ISR with on-demand revalidation when admin edits a product.
- **Accept:** Rich Results Test passes for Product pages; Lighthouse performance 90 or higher on mobile for home, category and product; sitemap lists all published URLs.

### Phase 5 — Customisation and artwork uploads

- Per-product customisation schema and form; live price calculation through a server price function.
- `FileDropzone`, `/api/uploads/presign` and confirm endpoints, magic-byte and dimension checks, DPI warnings, private artwork bucket, signed download URLs for staff.
- Mockup preview overlay; proof upload and approval workflow (staff side and customer side).
- **Accept:** oversize or wrong-type files are rejected server-side; artwork is never publicly listable; a proof can be sent, approved and recorded with a timestamp.

### Phase 6 — Cart, checkout, orders and abuse protection

- Cart (guest cookie plus logged-in server cart), `CartDrawer`, `OrderSummary`.
- Single-page checkout: contact, address, payment method, marketing checkbox (unchecked); optional account creation after order.
- Server-side order creation in one transaction: price recomputation, stock check, idempotency key, order number, status events.
- Shared rate limiting (Upstash), Turnstile on risk triggers, risk scoring module, risk policy settings, admin risk queue, COD phone confirmation flow, blocklist.
- Guest order tracking page by hashed token; account order history.
- **Accept:** tampering with prices in the request has no effect; double-clicking Place order creates one order; 20 rapid submissions from one client are throttled; a high-risk order lands in the review queue with logged reasons; production cannot start from an unapproved order.

### Phase 7 — Payments and transactional email

- `PaymentProvider` interface with chosen providers; signed webhook handlers, replay protection, idempotent event processing; bank-transfer proof upload and admin verification.
- Resend integration, React Email templates for the transactional list in Section 13; domain authentication (SPF, DKIM, DMARC); email event webhook for bounces.
- Refund and cancellation flows with audit logging.
- **Accept:** an order becomes paid only through a verified provider event or admin verification; forged webhook calls are rejected; all transactional emails render in major clients and have text fallbacks.

### Phase 8 — Promotion engine

- Schema, engine service, atomic redemption function, stacking and priority logic, first-order eligibility, coupon rate limiting, reversal on cancel or refund.
- Admin Marketing > Promotions UI with preview card, scheduling, pause, duplicate, redemption report.
- Storefront: `PromoBanner`, `ProgressToOffer`, `PromoCodeInput`, discount lines in cart and checkout.
- **Accept:** WELCOME20, the PKR 2,000 spend offer and a dated sale all work from admin config alone; PKR 2,500 eligible subtotal yields PKR 500 off; two concurrent checkouts cannot exceed a usage limit; unit tests cover caps, stacking, schedule edges and first-order logic.

### Phase 9 — WhatsApp inquiry

- `WhatsAppButton` on product pages, sticky mobile placement, optional floating help button, settings for number and template, click tracking.
- **Accept:** the link opens WhatsApp with the product name and canonical product URL prefilled; the number format is validated (digits only, international); no private data appears in the URL.

### Phase 10 — Verified-purchase reviews

- Schema, invite scheduler, guest review tokens, authenticated review path, `ReviewForm`, `ReviewCard`, `RatingSummary`, photo upload.
- Moderation queue, admin replies, review JSON-LD from published reviews only.
- **Accept:** a user without a qualifying order cannot submit; a second review for the same order item is rejected; tokens are single-use and expire; the badge appears only after backend verification.

### Phase 11 — Trending and best sellers

- `product_stats_daily` job, ranking queries, `/trending` page with the three sections, admin pin, exclude and date controls, promoted-label support.
- Event tracking for views and add-to-cart (privacy-conscious, no PII).
- **Accept:** rankings match fixtures in tests; low-activity products do not appear as trending; the page falls back to curated picks when data is thin.

### Phase 12 — Marketing email and retention

- `email_subscriptions` double opt-in, confirm endpoint, unsubscribe endpoint and preference page, `consent_events`.
- Footer and checkout subscription forms; welcome email; campaign sending through Resend or Brevo with segment filters; abandoned-cart and reorder emails for consenting users.
- **Accept:** unconfirmed addresses never receive campaigns; unsubscribe is immediate; tokens are hashed, single-use and expire; transactional email is unaffected by consent state.

### Phase 13 — Admin completion and analytics

- Dashboard widgets, customer pages, inquiries report, settings pages, audit-log viewer, staff roles and optional 2FA.
- Analytics events and funnel (view, add to cart, checkout, purchase, inquiry, subscribe).
- **Accept:** every admin action that changes money, status or visibility writes to the audit log; staff role cannot reach admin-only settings.

### Phase 14 — Content SEO, performance and accessibility

- Blog engine (MDX or database), 10 or more launch guides, landing pages, FAQ, policy pages, portfolio.
- Internal linking pass, image alt text pass, redirects map, Search Console and Bing verification, Merchant Center feed if used.
- Performance and accessibility audit on all templates, keyboard-only walkthrough, screen-reader spot checks.
- **Accept:** Core Web Vitals pass on mobile in field or lab data; axe tests have zero serious issues; every indexable page has unique title, description and canonical.

### Phase 15 — Security hardening, testing and launch

- Security review against Section 5; CSP and security headers; dependency audit; secret scan; abuse test scripts; backup export job and restore drill.
- Playwright end-to-end suites: browse to order (guest), login to order, coupon, upload, review, subscribe, admin order handling, risk hold.
- Load test checkout and upload endpoints at expected peak; verify free-tier limits and set usage alerts; confirm hosting plan satisfies commercial-use terms.
- DNS, SSL, domain email, production environment variables, Sentry and uptime monitors, launch checklist, rollback plan.
- **Accept:** all E2E tests pass on production-like preview; no high-severity findings open; runbook and handover documentation complete.

### Phase 16 — Post-launch iteration

- Weekly review of risk queue and false positives; monthly SEO and conversion review; collect reviews; expand blog and landing pages.
- Candidates for v2: in-browser design editor, Urdu and RTL, loyalty points, saved designs, courier API integration, WhatsApp Business API automation, mobile app or PWA install prompts, multi-currency.

## 19. Testing, quality and operations

- **Unit tests (Vitest):** money and rounding, promotion engine, risk scoring, order state machine, price calculation, token generation and verification, ranking logic.
- **Database tests:** RLS policies per role; redemption atomicity under concurrency; unique constraints.
- **Integration tests:** Server Actions and Route Handlers with a test Supabase instance; webhook signature verification.
- **E2E (Playwright):** critical journeys on mobile and desktop viewports.
- **Quality gates:** CI blocks merge on typecheck, lint, tests, build and a Lighthouse CI budget.
- **Environments:** local (Supabase local stack), preview (per PR), production. Never test against production data.
- **Observability:** Sentry for errors, structured server logs with request IDs, uptime checks on home, product, checkout API health.
- **Backups and recovery:** scheduled database dump to R2, tested restore, documented RPO and RTO.
- **Documentation to maintain:** `README.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/runbook.md`, `docs/env.md`, `docs/seo-keywords.md`, `docs/admin-guide.md` (for the client's staff).

### Environment variables (names only)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE`, `R2_PUBLIC_BASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `PAYMENT_PROVIDER_SECRETS` (per provider), `WEBHOOK_SIGNING_SECRETS`, `SENTRY_DSN`, `CRON_SECRET`. The WhatsApp number lives in admin settings, not in code.

## 20. Open questions for the client

1. Payment methods at launch: COD, online, both, bank transfer, quotation for bulk? (D22)
2. Guest checkout, account required, or guest plus optional account? (D23, default chosen)
3. Which online payment gateway(s) are acceptable and available for the business? (D24)
4. Courier partners and shipping rules: flat rate, weight-based, free-shipping threshold, cities served? (D25)
5. Domain name, WhatsApp business number, brand assets and tone of voice? (D26)
6. Bulk-order threshold (quantity and PKR value) that triggers manual confirmation?
7. Tax and invoicing requirements (sales tax registration, invoice format)?
8. Which products are customisable at launch, and what artwork formats and minimum resolution are required?
9. Production turnaround times per product and proof-approval policy?
10. Return, refund and reprint policy for custom products?
11. Will the site be commercial from day one, and is the client willing to move to a paid hosting plan if free-tier terms require it?
12. Languages at launch (English only, or Urdu too)?

## 21. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Free-tier limits or commercial-use terms | Usage alerts, budget for upgrade, portable architecture (standard Postgres, S3-compatible storage) |
| Supabase free project pausing or data loss | Scheduled backups to R2, activity keep-alive, upgrade trigger defined |
| Fake or COD-abuse orders | Section 7.2 controls, phone confirmation, advance payment for high-risk orders |
| Promotion abuse | Atomic usage limits, eligibility checks, risk signals, caps |
| Poor-quality customer artwork | DPI warnings, staff artwork review, proof approval |
| Spam or fake reviews | Verified-purchase gating, moderation, rate limits |
| SEO underperformance | Content plan, structured data, Core Web Vitals budget, Search Console monitoring |
| Scope creep | Phase gates, v2 list, change requests recorded in the decision log |

## 22. Definition of done (whole project)

- Every DECIDED item in Section 2 is implemented; every OPEN item is resolved or deliberately flagged.
- All phase acceptance criteria pass; CI and E2E green.
- Security principles in Section 5 verified with evidence.
- Staff can manage products, orders, promotions, trends, reviews and settings without developer help, and have an admin guide.
- Production site is indexed, monitored, backed up and documented.

## 23. Kickoff prompt for the coding agent

> You are building Inkora Studio from `PROJECT_SPEC.md`. Read the whole document first. Start with Phase 0 and Phase 1. Follow the agent rules in Section 0. Use Next.js (App Router), TypeScript strict, Tailwind and shadcn/ui, Supabase, Cloudflare R2 and Vercel. Do not start a phase until the previous phase's acceptance criteria pass. After each phase, summarise what changed, list any decision you made on an OPEN item, and propose the next step. Ask before introducing any new paid service or dependency.
