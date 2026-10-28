# Inkora Studio — Architecture Reference

This document outlines the system architecture, boundaries, components, and data flow for the Inkora Studio platform, as defined in Section 4 of the Master Project Specification.

---

## 1. High-Level Architecture

Inkora Studio is built as a **modular monolith** on Next.js (App Router), deployed on Vercel. There is no separate standalone backend microservice.

```
Browser (Next.js UI: Storefront, Customizer, Cart, Checkout, Admin)
   │
   ▼ (Server Actions for mutations / Route Handlers for webhooks & presigned uploads)
Next.js Server (App Router on Vercel)
   ├── Supabase (PostgreSQL + Auth + Row Level Security)
   ├── Cloudflare R2 (S3-compatible presigned upload/download)
   ├── Resend / Brevo (Transactional and consented marketing email)
   ├── Payment Provider (Signed webhooks / manual verification)
   └── Upstash Redis (Distributed rate limiting & idempotency cache)
```

---

## 2. Directory & Module Boundaries

The project strictly follows the module architecture specified in Section 4.1:

```
src/
├── app/
│   ├── (store)/                 # Public storefront (SSR / ISR)
│   │   ├── page.tsx             # Home
│   │   ├── products/            # Catalog listing & [slug]
│   │   ├── categories/[slug]/   # Category landing pages
│   │   ├── trending/            # 30-day bestsellers, trending now, popular picks
│   │   ├── cart/                # Cart line management
│   │   ├── checkout/            # Single-page 3-step checkout
│   │   ├── order/[token]/       # Guest order tracking by hashed token
│   │   ├── review/[token]/      # Guest verified-purchase review submission
│   │   ├── account/             # Authenticated customer portal
│   │   ├── blog/                # SEO content & buying guides
│   │   └── (legal)/             # Privacy, terms, refund, shipping policies
│   ├── admin/                   # Role-protected dashboard (admin/staff)
│   ├── api/
│   │   ├── webhooks/            # Payment gateway and email event webhooks
│   │   ├── uploads/             # Presigned upload URLs and verification confirm
│   │   └── subscribe/confirm/   # Double opt-in confirmation endpoint
│   ├── sitemap.ts · robots.ts · manifest.ts
├── components/
│   ├── ui/                      # shadcn/ui primitives (Radix-based)
│   ├── shared/                  # Reusable composites (Price, DataTable, FormField, etc.)
│   └── (feature folders: products, customization, checkout, marketing, admin)
├── modules/                     # Business domain logic
│   ├── products/ orders/ customers/ payments/ fulfillment/
│   ├── promotions/ reviews/ trends/ subscriptions/ inquiries/ risk/
│   └── (each contains: schema.ts, queries.ts, service.ts, actions.ts, types.ts, tests/)
├── lib/
│   ├── supabase/                # Browser, server, and admin SSR client helpers
│   ├── r2/                      # S3 client and presigned URL helpers
│   ├── auth/                    # Role checks and session guards
│   ├── validation/              # Shared Zod validation helpers
│   ├── email/                   # Resend client and React Email templates
│   ├── ratelimit/               # Upstash Redis rate limiting
│   ├── money/                   # Integer minor unit calculations and PKR formatting
│   ├── seo/                     # JSON-LD and metadata generators
│   └── env.ts                   # Zod-validated environment config
└── types/                       # Global and database-generated types
```

---

## 3. Data & Mutation Principles

1. **Pages contain composition only**: Presentation components render data and dispatch Server Actions.
2. **Business logic lives in `modules/*/service.ts`**: Pure calculation, domain rules, state machines.
3. **Database queries live in `queries.ts`**: Components and actions must not execute raw SQL or ad-hoc database queries.
4. **Public Module API via `index.ts`**: Modules must never reach into internal files of other modules.
5. **No Client Trust**:
   - Client sends product ID, variant options, quantity, and customer input.
   - Server fetches active catalog prices, computes totals, checks inventory, and writes orders atomically inside PostgreSQL transactions.
6. **Strict Money Handling**:
   - Currency is PKR.
   - Money is handled as integer minor units (paisa) or integer PKR. Never floating-point numbers.

---

## 4. Security & Isolation Boundaries

- **Database RLS**: Every table in the `public` schema has Row Level Security enabled. RLS policies restrict anonymous users to published catalog items and authenticated users to their own records.
- **Server Guard Boundary**: Middleware checks sessions for `/admin/*`; Server Actions verify roles (`admin` or `staff`) before executing sensitive functions.
- **Storage Isolation**:
  - `R2_BUCKET_PRIVATE`: Stores customer artwork and order attachments. Accessible only via short-lived signed URLs for staff review.
  - `R2_BUCKET_PUBLIC`: Stores public catalog images and logos served via Cloudflare CDN.
- **Abuse Prevention**:
  - Shared Redis rate-limiting (Upstash) across edge instances.
  - Cloudflare Turnstile bot verification on sensitive or flagged actions.
