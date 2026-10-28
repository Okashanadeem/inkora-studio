# Phase 8 — Promotion engine

## Tasks
- [ ] Schema, engine service, atomic redemption function, stacking and priority logic, first-order eligibility, coupon rate limiting, reversal on cancel or refund.
- [ ] Admin Marketing > Promotions UI with preview card, scheduling, pause, duplicate, redemption report.
- [ ] Storefront: `PromoBanner`, `ProgressToOffer`, `PromoCodeInput`, discount lines in cart and checkout.

## Acceptance Criteria
- [ ] WELCOME20, the PKR 2,000 spend offer and a dated sale all work from admin config alone.
- [ ] PKR 2,500 eligible subtotal yields PKR 500 off.
- [ ] Two concurrent checkouts cannot exceed a usage limit.
- [ ] Unit tests cover caps, stacking, schedule edges and first-order logic.
