KidsChem — Implementation Phases (Phase 1 → Phase 7)
Version: 1.0.0
Generated from: KidsChem_Master_Production_PRD.pdf
Date: 2026-06-12

Overview
This document maps the PRD into seven execution phases. Each phase includes goals, concrete tasks, acceptance criteria, dependencies, and a rough timeline estimate. Use this as the canonical implementation plan that teams (frontend, backend, data, AI, QA, product) will follow.

MVP Scope (Phase 1+2 minimum)
- Supabase-backed auth and basic roles (parent, teacher, student)
- Topic ingestion for a limited pilot set (5 topics)
- Story reader + Lab Box minimal interactive canvas with 3 assets
- Basic quiz + adaptive remedial loop
- Local video playback (hosted) and basic analytics
su
Phase 1 — Core Platform Foundations (2–3 weeks)
Goal: Establish project skeleton, infra, and core data models so other work can integrate safely.
Tasks:
- Initialize Next.js App Router project and Tailwind CSS configuration
- Add Framer Motion dependency and base design tokens per PRD aesthetic
- Provision Supabase project (schema migration scripts) and add DB types
- Implement DB schemas from PRD: enums, profiles, students, subscriptions, monime_transactions, topics, quizzes, quiz_questions, quiz_attempts
- Set up GitHub repo CI skeleton and pre-commit hooks
Deliverables:
- Running Next.js app shell with auth endpoints connected to Supabase
- SQL migration file(s) in /db/migrations
Acceptance Criteria:
- Local dev can sign up/login using Supabase auth and create profile rows
- DB migrations run successfully
Dependencies: None

Phase 2 — Content Ingestion + Story Reader (2–3 weeks)
Goal: Provide the content pipeline and UI for simplified stories and topic pages.
Tasks:
- Create admin ingestion script to import textbook stories (CSV/JSON) and lab_config JSONB
- Build Topic page (story reader) with typography, brand colors, and progress indicator
- Implement topic model API endpoints (GET topics, GET topic/:slug)
- Add video_url rendering with resilient playback (progressive fallback)
Deliverables:
- Admin/import script
- Topic pages and API endpoints
Acceptance Criteria:
- Editors can import 5 pilot topics and view them in UI
- Story reader respects PRD visual tokens and displays lab_config
Dependencies: Phase 1

Phase 3 — Virtual Lab Box Sandbox Minimal (3–4 weeks)
Goal: Deliver an initial tactile canvas supporting drag/drop interactions, collision events, and Framer Motion particle feedback.
Tasks:
- Implement Canvas component with z-layer management and inventory tray
- Implement three example assets (e.g., candle, beaker, leaf) and basic asset palette
- Implement collision detection and rule engine for declarative lab_config (JSON-driven reactions)
- Add simple timeline and real-time property display (oxygen level, flame state)
- Record local session state and sync to Supabase (offline-first approach)
Deliverables:
- Working Lab Box sandbox for 3 use-cases
- Example lab_config JSON files demonstrating reaction rules
Acceptance Criteria:
- Users can perform the candle/beaker/leaf scenario and see UI changes and animation
- Canvas state persists locally and syncs to server when online
Dependencies: Phase 1, Phase 2

Phase 4 — Adaptive Mastery Quiz Loop & Analytics (2–3 weeks)
Goal: Ship the adaptive quiz system and basic analytics required for mastery loops.
Tasks:
- Implement quizzes, question rendering, options, and client-side validation
- Implement remedial flow: block completion on incorrect, show textbook explanation, and re-queue a variation
- Implement quiz_attempts table writes and attempt_iteration tracking
- Add learning-map visualization for student progress (weak node highlighting)
- Connect light-weight event telemetry to Supabase (page views, attempts, streaks)
Deliverables:
- Quiz engine, remedial loop UI, and progress map
Acceptance Criteria:
- Incorrect answers trigger remedial step and increment attempt_iteration
- Passing a quiz updates streaks and progress map
Dependencies: Phase 1, Phase 2, Phase 3

Phase 5 — Sci-Buddy AI Companion (3–5 weeks)
Goal: Deliver a bounded AI companion that answers curriculum-grounded questions using vector embeddings and textbook ground truth.
Tasks:
- Build ingestion pipeline for textbook corpus and create vector embeddings (per-topic) stored in a vector store (Supabase vector or external)
- Implement Sci-Buddy backend service that retrieves grounding docs and composes answers with guardrails
- Implement off-topic classifier and sensitive-content filters per PRD
- Add UI chat component with session-level context and tooltips for source citations (page refs)
Deliverables:
- Sci-Buddy service, embedding store, and chat UI
Acceptance Criteria:
- Sci-Buddy answers topic-scoped questions with source citations
- Off-topic inputs receive guardrail messaging
Dependencies: Phase 1–4; access to model infra / API keys
Notes:
- Start with a smaller model and caching for cost control. Evaluate retrieval quality before expanding.

Phase 6 — Payments & Subscriptions (Monime) (2–4 weeks)
Goal: Integrate Monime USSD mobile-money weekly payments, subscription lifecycle, and server webhooks.
Tasks:
- Implement subscriptions table controls and billing cadence enforcement
- Integrate Monime API for payment initiation and webhook verification
- Implement secure webhook receiver and transaction reconciliation
- Implement UI for parent account to manage subscription and view payment history
Deliverables:
- Monime integration in sandbox and production-ready webhook handlers
Acceptance Criteria:
- Test payment flows simulate USSD hooks and webhook updates change subscription state
- No payment flow leaves inconsistent DB states
Dependencies: Phase 1; Monime credentials and sandbox
Security:
- Validate webhooks with signatures; store raw payloads; ensure idempotency

Phase 7 — QA, Localization, Performance & Launch (2–4 weeks)
Goal: Harden system, complete localization for Sierra Leone English variants, run performance tests, and prepare release artifacts.
Tasks:
- Add automated testing (unit, integration, e2e for key flows)
- Conduct accessibility and usability audits for ages 8–15
- Localize strings and content, support right lessons and page references for Aki-Ola / MBSSE alignment
- Load-test video playback fallback and canvas performance on low-end devices
- Prepare launch checklist, analytics dashboards, teacher/parent onboarding materials
Deliverables:
- Test suite with passing core tests, localization bundle, performance report, and launch checklist
Acceptance Criteria:
- Core e2e flows pass; Canvas runs at target frame rate on target devices; localization QA completed

Cross-Phase Nonfunctional Requirements
- Security & Privacy: GDPR-adjacent safeguards, safe handling of child data, minimal PII in telemetry
- Offline-synchronization: Browser local cache with sync reconciliation
- CI/CD: Deploy preview environments for each PR; automated DB migrations during deployment
- Observability: Add traceable events for billing, quiz attempts and AI interactions

Milestones & Rough Timeline (Conservative)
- Month 0.5: Phase 1 complete
- Month 1.5: Phase 2 + 3 complete (Basic Lab + Stories)
- Month 2.0: Phase 4 complete (Quizzes)
- Month 3.5: Phase 5 complete (Sci-Buddy pilot)
- Month 4.0: Phase 6 complete (Payments)
- Month 4.5: Phase 7 complete and launch-ready

Risks & Mitigations
- AI grounding errors -> limit to retrieval + template outputs and add human review for high-visibility answers
- Low-end device performance -> prioritize minimal DOM, canvas optimizations, and particle LOD
- Payment/regulatory delays -> integrate test-mode Monime and provide manual top-up flow for pilot

Next Actions (developer / PM)
- Review and approve this phased plan
- Create sprint tickets for Phase 1 and assign owners
- Provision Supabase project and share credentials for dev environment

Maintainers
- Product Owner: [TBD]
- Engineering Lead: [TBD]
- AI Lead: [TBD]


© KidsChem Confidential
