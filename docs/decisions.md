# Inkora Studio — Architectural Decision Log (ADR)

This file tracks all foundational architectural decisions (`DECIDED`), proposed conventions (`PROPOSED`), and open client decisions (`OPEN`) with documented defaults as per Section 2 of the Master Project Specification.

---

## Decision Index

| ID | Title | Status | Summary |
|---|---|---|---|
| D1 | Modular Monolith on Next.js | DECIDED | App Router, SSR/ISR, no separate backend microservice |
| D2 | Language: TypeScript | DECIDED | Strict mode across client, server, and migrations |
| D3 | Database & Auth: Supabase | DECIDED | PostgreSQL with Auth and strict Row Level Security (RLS) |
| D4 | File Storage: Cloudflare R2 | DECIDED | Private bucket for artwork; public bucket for catalog images |
| D5 | Hosting: Vercel | DECIDED | Edge network hosting for Next.js App Router |
| D6 | Mutations via Server Actions | DECIDED | Route Handlers reserved for webhooks and presigned uploads |
| D7 | Two-Tier Authorization | DECIDED | Server Action / Middleware guard + PostgreSQL RLS policies |
| D8 | Distributed Rate Limiting | DECIDED | Upstash Redis (no in-memory counters on ephemeral serverless) |
| D9 | Order Risk Evaluation | DECIDED | Low/Medium/High scoring, logged reasons, admin review queue |
| D10 | Payment Verification | DECIDED | Orders marked paid only on verified signed webhooks or admin confirmation |
| D11 | Production Prerequisites | DECIDED | Production unlocks only after payment, customer confirmation, and artwork approval |
| D12 | Consented Marketing Email | DECIDED | Optional, unchecked checkbox, double opt-in, distinct from transactional mail |
| D13 | Email Subscription Tokens | DECIDED | Separate `email_subscriptions` table with hashed single-use tokens |
| D14 | Transactional Email Service | DECIDED | Resend with React Email templates; Brevo evaluated for bulk campaigns |
| D15 | Promotion Engine | DECIDED | Server-calculated percentage/fixed, minimum spend, first-order, atomic redemptions |
| D16 | Trends & Bestsellers Logic | DECIDED | 30-day sales, recent growth, curated picks with admin pin/exclude |
| D17 | Verified-Purchase Reviews | DECIDED | Reviews gated by verified purchase; guest tokens; moderation queue |
| D18 | WhatsApp Direct Inquiry | DECIDED | Prefilled `wa.me` links with canonical product URLs; click analytics |
| D19 | Core Build Sequence | DECIDED | 1: Promotions, 2: WhatsApp, 3: Reviews, 4: Trends |
| D20 | UI Kit & Component Primitives | DECIDED | Tailwind CSS + shadcn/ui + Radix UI + lucide-react |
| D21 | Visual Identity & Design Tokens | PROPOSED | Warm off-white, ink blue primary, vivid magenta/orange accent, WCAG 2.2 AA |
| D22 | Payment Methods at Launch | OPEN (Defaulted) | **Default:** COD (with phone/WhatsApp confirmation) + Bank Transfer (with proof) + Bulk Quotation |
| D23 | Checkout Account Policy | OPEN (Defaulted) | **Default:** Guest checkout with optional post-order account creation |
| D24 | Online Payment Gateway | OPEN (Defaulted) | Abstracted via `PaymentProvider` interface; JazzCash/Easypaisa pending client setup |
| D25 | Courier Partner Integration | OPEN (Defaulted) | Manual tracking numbers in v1 (TCS/Leopards); API automation deferred to v2 |
| D26 | Store Domain & WhatsApp Number | OPEN (Defaulted) | Configurable via Admin Settings and environment variables |

---

## Detailed Notes on Open Decisions (D22 – D26)

### D22: Payment Methods at Launch
- **Decision**: Implemented behind a `PaymentProvider` abstraction (`cod`, `bank_transfer`, `quotation`, `online`).
- **Default Launch Configuration**:
  - Cash on Delivery (COD) enabled with phone confirmation check on high-risk/new buyers.
  - Bank Transfer with proof upload enabled.
  - Bulk orders routed through quotation or manual confirmation.

### D23: Guest vs Account Checkout
- **Decision**: Adopt the lowest-friction path: **Guest checkout with optional post-order account creation**.
- **Rationale**: Reduces checkout drop-off while providing an easy prompt on the order success page to create a password and claim past orders.

### D24: Online Payment Gateway
- **Decision**: Core code does not depend on a specific gateway. All payment interactions adhere to the `PaymentProvider` interface with signed webhook verification.

### D25: Courier Integration
- **Decision**: Order shipments will store courier name and tracking number in `shipments` table. Couriers can be tracked via web links. Automated courier API integration is deferred to Phase 16 / v2.

### D26: WhatsApp & Domain
- **Decision**: WhatsApp business number is configured in the `settings` database table and administered through `/admin/settings`.
