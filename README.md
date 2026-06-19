# KidsChem 🧪

**Interactive Science Simplifier & Visual Sandbox**

KidsChem is a next-generation educational platform designed for students aged 8-15 in Sierra Leone. It transforms complex science curriculum (Chemistry, Physics, Biology) into simplified, interactive stories and tactile virtual experiments. By combining high-speed AI assistance with a hands-on "sandbox" approach, KidsChem makes learning science intuitive, engaging, and fun.

---

## 🚀 Features

- **Simplified Story Reader:** Core curriculum concepts distilled into engaging, age-appropriate narratives with integrated video lessons.
- **Tactile Virtual Lab:** A JSON-driven interactive canvas where students can perform experiments (e.g., oxygen combustion) with real-time feedback and particle physics.
- **Adaptive Mastery Quizzes:** A "smart" quiz engine that detects weak points and provides immediate textbook-grounded remediation before allowing progress.
- **Sci-Buddy AI Companion:** A high-speed AI tutor powered by **Cerebras** and **RAG** (Retrieval-Augmented Generation) that provides curriculum-accurate answers with source citations.
- **Science Adventure Map:** A visual learning path that tracks student progress, streaks, and mastery badges.
- **Monime Mobile Money:** Integrated USSD and Mobile Money payment system (Orange Money/Afrimoney) for easy weekly "Pro" subscriptions.
- **Parent Dashboard:** Dedicated interface for parents to manage student accounts, view detailed progress reports, and handle billing.

---

## 🛠️ Technical Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animations:** Framer Motion, GSAP
- **ORM:** Prisma
- **Backend/Database:** Supabase (PostgreSQL, Auth), Neon DB
- **AI/ML:** Cerebras (Inference), Hugging Face (Embeddings), pgvector (Semantic Search)
- **Payments:** Monime API (Sierra Leone)
- **Testing:** Jest, React Testing Library

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL Database (e.g., Neon, Supabase)
- A neon Project (for Auth)
- A Cerebras API Key
- A Hugging Face Access Token
- A Monime Space ID & Access Token

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kidschem.git
   cd kidschem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in your credentials, especially `DATABASE_URL`.

4. **Initialize the Database:**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   ```

5. **Seed the Content:**
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Quality Assurance

We use Jest and React Testing Library to ensure the reliability of our core logic and components.

```bash
# Run all tests
npm test

# Run a production build
npm run build
```

---

## 🌍 Mission

KidsChem is built to democratize high-quality science education in Sierra Leone, ensuring that every child—regardless of their school's physical lab resources—has the tools to become a future scientist.

---

© 2026 KidsChem. All Rights Reserved.
