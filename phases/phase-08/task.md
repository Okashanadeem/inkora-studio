# Phase 8 — Promotion engine

## Tasks

- [x] Schema, engine service, atomic redemption function, stacking and priority logic, first-order eligibility, coupon rate limiting, reversal on cancel or refund.
- [x] Admin Marketing > Promotions UI with preview card, scheduling, pause, duplicate, redemption report.
- [x] Storefront: `PromoBanner`, `ProgressToOffer`, `PromoCodeInput`, discount lines in cart and checkout.

## Acceptance Criteria

- [x] WELCOME20, the PKR 2,000 spend offer and a dated sale all work from admin config alone.
- [x] PKR 2,500 eligible subtotal yields PKR 500 off.
- [x] Two concurrent checkouts cannot exceed a usage limit.
- [x] Unit tests cover caps, stacking, schedule edges and first-order logic.
