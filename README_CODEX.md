# Dividend Freedom Pro — Codex-ready package

This folder is packaged so you can hand it to Codex and have it run **without requiring a fresh Next.js build** (the `.next/` production build output is included).

## Quick start
1) Copy `.env.local.example` to `.env.local` and fill values.
2) Install deps (lockfile included):

```bash
npm ci
```

3) Run production server (uses the included `.next/` build):

```bash
npm run start
```

## If you change code
Rebuild:

```bash
npm run build
```

## Notes
- Auth: Clerk
- DB: Supabase
- Payments: Stripe
- Webhooks route: `app/api/webhooks/stripe/route.ts`
