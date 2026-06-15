Phase 2 — Content Ingestion + Story Reader

What this adds:
- db/sample_topics.json: sample topic payloads for Phase 2
- scripts/import_topics.ts: helper to generate SQL insert statements from sample topics
- API endpoint: app/api/topics/route.ts (GET /api/topics and /api/topics?slug=slug)
- Topic pages: app/topics/[slug]/page.tsx server-rendered story reader

How to use:
1. Import the sample topics into your Supabase DB by running:
   node ./scripts/import_topics.ts > import.sql
   psql < import.sql

2. Start dev server: npm run dev
3. Visit /topics/oxygen-combustion and /topics/states-of-matter

Notes:
- Replace scripts/import_topics.ts with a Supabase client script when ready to write directly to DB.
- Add video_url values in db/sample_topics.json for video playback integration.
