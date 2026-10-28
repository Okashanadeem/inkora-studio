# Phase 6 — Cart, checkout, orders and abuse protection

## Tasks

- [x] Cart (guest cookie plus logged-in server cart), `CartDrawer`, `OrderSummary`.
- [x] Single-page checkout: contact, address, payment method, marketing checkbox (unchecked); optional account creation after order.
- [x] Server-side order creation in one transaction: price recomputation, stock check, idempotency key, order number, status events.
- [x] Shared rate limiting (Upstash), Turnstile on risk triggers, risk scoring module, risk policy settings, admin risk queue, COD phone confirmation flow, blocklist.
- [x] Guest order tracking page by hashed token; account order history.

## Acceptance Criteria

- [x] Tampering with prices in the request has no effect.
- [x] Double-clicking Place order creates one order.
- [x] 20 rapid submissions from one client are throttled.
- [x] A high-risk order lands in the review queue with logged reasons.
- [x] Production cannot start from an unapproved order.
