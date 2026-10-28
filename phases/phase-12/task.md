# Phase 12 — Marketing email and retention

## Tasks
- [ ] Implement `email_subscriptions` double opt-in, confirm endpoint, unsubscribe endpoint and preference page, `consent_events`.
- [ ] Build footer and checkout subscription forms; welcome email; campaign sending through Resend or Brevo with segment filters; abandoned-cart and reorder emails for consenting users.

## Acceptance Criteria
- [ ] Unconfirmed addresses never receive campaigns.
- [ ] Unsubscribe is immediate.
- [ ] Tokens are hashed, single-use and expire.
- [ ] Transactional email is unaffected by consent state.
