# Phase 15 — Security hardening, testing and launch

## Tasks
- [ ] Conduct security review against Section 5; CSP and security headers; dependency audit; secret scan; abuse test scripts; backup export job and restore drill.
- [ ] Build Playwright end-to-end suites: browse to order (guest), login to order, coupon, upload, review, subscribe, admin order handling, risk hold.
- [ ] Load test checkout and upload endpoints at expected peak; verify free-tier limits and set usage alerts; confirm hosting plan satisfies commercial-use terms.
- [ ] Configure DNS, SSL, domain email, production environment variables, Sentry and uptime monitors, launch checklist, rollback plan.

## Acceptance Criteria
- [ ] All E2E tests pass on production-like preview.
- [ ] No high-severity findings open.
- [ ] Runbook and handover documentation complete.
