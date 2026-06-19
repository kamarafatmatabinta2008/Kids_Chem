# KidsChem Launch Checklist 🚀

## 1. Environment & Infrastructure
- [ ] **Supabase Production:** Provision production project and run `001_init.sql`.
- [ ] **OpenAI/Cerebras Keys:** Set production API keys in environment.
- [ ] **HuggingFace Key:** Ensure inference token is valid.
- [ ] **Monime Production:** Switch to `mon_live_` tokens and set production `MONIME_SPACE_ID`.
- [ ] **Deployment:** Configure Vercel/Netlify with all `.env` variables.

## 2. Content & QA
- [ ] **Final Ingestion:** Run `seed_topics.ts` and `seed_quizzes.ts` on production DB.
- [ ] **AI Grounding:** Run `ingest_knowledge.ts` to populate vector store.
- [ ] **Link Check:** Verify all "Back to Dashboard" and navigation links.
- [ ] **Mobile Responsive:** Test Lab Box and Quiz on smaller screens (iOS/Android).

## 3. Performance & Accessibility
- [ ] **Image Optimization:** Ensure topic images/avatars are compressed.
- [ ] **Contrast Check:** Verify readability for 8-15 age range (WCAG AA).
- [ ] **Low-Bandwidth Test:** Verify app loads smoothly on 3G speeds.

## 4. Legal & Compliance
- [ ] **Privacy Policy:** Add link to Footer (handle child data protection).
- [ ] **Terms of Service:** Define subscription refund/cancellation policy.

## 5. Analytics
- [ ] **Event Tracking:** Verify quiz attempts and subscriptions are appearing in Supabase logs.
