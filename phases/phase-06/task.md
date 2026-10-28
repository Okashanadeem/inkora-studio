# Phase 6 — Cart, checkout, orders and abuse protection

## Tasks
- [ ] Cart (guest cookie plus logged-in server cart), `CartDrawer`, `OrderSummary`.
- [ ] Single-page checkout: contact, address, payment method, marketing checkbox (unchecked); optional account creation after order.
- [ ] Server-side order creation in one transaction: price recomputation, stock check, idempotency key, order number, status events.
- [ ] Shared rate limiting (Upstash), Turnstile on risk triggers, risk scoring module, risk policy settings, admin risk queue, COD phone confirmation flow, blocklist.
- [ ] Guest order tracking page by hashed token; account order history.

## Acceptance Criteria
- [ ] Tampering with prices in the request has no effect.
- [ ] Double-clicking Place order creates one order.
- [ ] 20 rapid submissions from one client are throttled.
- [ ] A high-risk order lands in the review queue with logged reasons.
- [ ] Production cannot start from an unapproved order.
