Phase 1 — Core Platform Foundations

This folder contains initial scaffolding created for Phase 1.

Next steps for developers:
- Install dependencies: npm ci (or npm install)
- Configure .env.local with SUPABASE_URL and SUPABASE_KEY and other secrets
- Run DB migration: psql < db/migrations/001_init.sql (or use Supabase migration tooling)
- Start dev server: npm run dev

Notes:
- Framer Motion and GSAP are declared in package.json. Confirm when to run installs.
- Keep DB migrations under db/migrations and apply in CI deploys.
