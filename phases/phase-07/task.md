# Phase 7 — Payments and transactional email

## Tasks
- [ ] Implement `PaymentProvider` interface with chosen providers; signed webhook handlers, replay protection, idempotent event processing; bank-transfer proof upload and admin verification.
- [ ] Resend integration, React Email templates for the transactional list in Section 13; domain authentication (SPF, DKIM, DMARC); email event webhook for bounces.
- [ ] Refund and cancellation flows with audit logging.

## Acceptance Criteria
- [ ] An order becomes paid only through a verified provider event or admin verification.
- [ ] Forged webhook calls are rejected.
- [ ] All transactional emails render in major clients and have text fallbacks.
