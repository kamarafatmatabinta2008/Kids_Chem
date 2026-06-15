Phase 3 — Virtual Lab Box Sandbox Minimal

What this adds:
- src/lab/ruleEngine.ts: JSON-driven rule evaluator for lab interactions
- app/components/EnhancedLabBox.tsx: client component with drag/drop, collision detection, GSAP + Framer Motion animations, localStorage persistence and best-effort /api/lab-sync sync
- app/api/lab-sync/route.ts: lightweight server endpoint (accepts POST) for state sync stubs
- Lab page updated to include EnhancedLabBox (and legacy LabBox demo)

How to test locally:
1. Start dev server: npm run dev
2. Open /lab and try dragging Beaker onto the Candle area and dropping Leaf into the Beaker. Observe oxygen changes and flame animations.
3. Inspect network requests for POST /api/lab-sync to confirm sync attempts.

Notes & Next steps:
- Replace /api/lab-sync stub with a secure Supabase write path when ready.
- Expand rule engine to support richer declarative conditions and timelines.
