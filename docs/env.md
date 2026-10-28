# Inkora Studio — Environment Variables Reference

This document catalogs every environment variable required by the Inkora Studio platform. Environment variables are parsed and validated strictly via `src/lib/env.ts` with Zod at build and runtime. Missing or invalid variables will fail fast.

> **CRITICAL SECURITY NOTE:**
> - Never commit `.env`, `.env.local`, or any actual secrets to source control.
> - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
> - Non-prefixed variables are strictly server-only.

---

## 1. Application & Domain Configuration

| Variable | Scope | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public / Client | Canonical URL of the store | `https://inkorastudio.com` or `http://localhost:3000` |
| `NODE_ENV` | Shared | Node execution environment | `development` \| `test` \| `production` |

---

## 2. Supabase (Database & Authentication)

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client | Project HTTPS URL from Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client | Public anonymous key for client requests (subject to RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Only** | Administrative service role key (bypasses RLS). **Never expose to client.** |

---

## 3. Cloudflare R2 (S3-Compatible Storage)

| Variable | Scope | Description |
|---|---|---|
| `R2_ACCOUNT_ID` | **Server Only** | Cloudflare account identifier |
| `R2_ACCESS_KEY_ID` | **Server Only** | S3 API token access key ID |
| `R2_SECRET_ACCESS_KEY` | **Server Only** | S3 API token secret access key |
| `R2_BUCKET_PUBLIC` | **Server Only** | Name of the bucket for public catalog images |
| `R2_BUCKET_PRIVATE` | **Server Only** | Name of the bucket for private customer artwork and proofs |
| `R2_PUBLIC_BASE_URL` | **Server / Public** | CDN URL pointing to the public bucket (e.g. `https://cdn.inkorastudio.com`) |

---

## 4. Email Service (Resend)

| Variable | Scope | Description |
|---|---|---|
| `RESEND_API_KEY` | **Server Only** | API key for transactional email delivery via Resend |
| `EMAIL_FROM` | **Server Only** | Sender header address (e.g., `Inkora Studio <orders@inkorastudio.com>`) |

---

## 5. Rate Limiting (Upstash Redis)

| Variable | Scope | Description |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | **Server Only** | REST URL endpoint for Upstash Redis database |
| `UPSTASH_REDIS_REST_TOKEN` | **Server Only** | Authentication REST token for Upstash Redis |

---

## 6. Bot Protection (Cloudflare Turnstile)

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`| Public / Client | Public site key for Cloudflare Turnstile widget |
| `TURNSTILE_SECRET_KEY` | **Server Only** | Server secret key for verifying Turnstile response tokens |

---

## 7. Payments & Webhooks

| Variable | Scope | Description |
|---|---|---|
| `PAYMENT_PROVIDER_SECRETS` | **Server Only** | JSON or delimited configuration of active payment provider keys |
| `WEBHOOK_SIGNING_SECRETS` | **Server Only** | Secrets used to verify HMAC signatures on incoming provider webhooks |

---

## 8. Operations, Sentry & Cron

| Variable | Scope | Description |
|---|---|---|
| `SENTRY_DSN` | Shared | Sentry DSN for application error monitoring and alerting |
| `CRON_SECRET` | **Server Only** | Bearer secret required to trigger scheduled tasks (e.g. `product_stats_daily`) |
