# Phase 7 — Payments and transactional email

## Tasks

- [x] Implement `PaymentProvider` interface with chosen providers; signed webhook handlers, replay protection, idempotent event processing; bank-transfer proof upload and admin verification.
- [x] Resend integration, React Email templates for the transactional list in Section 13; domain authentication (SPF, DKIM, DMARC); email event webhook for bounces.
- [x] Refund and cancellation flows with audit logging.

## Acceptance Criteria

- [x] An order becomes paid only through a verified provider event or admin verification.
- [x] Forged webhook calls are rejected.
- [x] All transactional emails render in major clients and have text fallbacks.
