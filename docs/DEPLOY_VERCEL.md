# Dividend Freedom Pro - Deploy Guide (Vercel, No GitHub)

This project can be deployed directly from your local machine to Vercel.

## Prerequisites

- Node.js `>= 18.17.0` (already enforced in `package.json`)
- Vercel account: https://vercel.com
- Optional FMP key: https://financialmodelingprep.com

## 1) Verify local project health

From the project root:

```bash
npm install
npm run verify
```

Expected:

- `npm test` -> `93/93 passed`
- `npm run typecheck` -> no TypeScript errors

## 2) Install and login to Vercel CLI

Option A (global install, recommended by the original guide):

```bash
npm install -g vercel
vercel login
```

Option B (without global install):

```bash
npx vercel login
```

## 3) First deploy (preview URL)

```bash
npm run deploy:preview
```

Vercel will build and return a live URL like:

`https://your-project-name.vercel.app`

## 4) Redeploy to production

```bash
npm run deploy:prod
```

## Troubleshooting

- `vercel: command not found`
  - Run `npm install -g vercel`, then reopen terminal.
- Build fails on Vercel
  - Check deployment logs and verify runtime env vars are set correctly.
- FMP key invalid
  - Regenerate at Financial Modeling Prep and retry.

## Quick command list

```bash
node --version
npm install
npm run verify
npm run deploy:login
npm run deploy:preview
npm run deploy:prod
```
