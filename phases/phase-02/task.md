# Phase 2 — Database, auth and RLS

## Tasks

- [x] Supabase CLI migrations for the data model in Section 6; generated TypeScript types.
- [x] Enable RLS on every table with explicit policies; seed script for development.
- [x] Auth: email and password plus optional Google; email verification; password reset; SSR session helpers; middleware for protected routes.
- [x] Implement `user_roles`, admin guard helper, audit log helper, idempotency helper.
- [x] RLS tests (pgTAP or SQL tests): anonymous, customer, staff and admin cases for each table.

## Acceptance Criteria

- [x] A customer cannot read another customer's rows.
- [x] Anonymous users see only published catalogue data.
- [x] Service-role key is only imported in server modules (lint rule enforces it).
