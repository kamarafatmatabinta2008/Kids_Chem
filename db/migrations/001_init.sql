-- KidsChem initial schema (from PRD)
-- Enums
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('parent','teacher','student');
CREATE TYPE IF NOT EXISTS science_tier AS ENUM ('PRIMARY','JSS');
CREATE TYPE IF NOT EXISTS science_subject AS ENUM ('BIOLOGY','CHEMISTRY','PHYSICS');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('PENDING','SUCCESSFUL','FAILED');

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  tier science_tier NOT NULL,
  targeted_weakness science_subject,
  continuous_streak_days INT DEFAULT 0 NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_pro_active BOOLEAN DEFAULT FALSE NOT NULL,
  tier_price_leones NUMERIC(10,2) DEFAULT 5.00 NOT NULL,
  period_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Monime transactions
CREATE TABLE IF NOT EXISTS public.monime_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  phone_number TEXT NOT NULL,
  monime_reference TEXT UNIQUE NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  webhook_raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Topics
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject science_subject NOT NULL,
  tier science_tier NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  story_content TEXT NOT NULL,
  video_url TEXT,
  lab_config JSONB NOT NULL,
  sort_order INT NOT NULL
);

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE UNIQUE NOT NULL,
  passing_score INT DEFAULT 80 NOT NULL
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL,
  explanations_from_textbook TEXT NOT NULL,
  UNIQUE(quiz_id, question_text)
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempt_iteration INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lab states (Phase 3 sync)
CREATE TABLE IF NOT EXISTS public.lab_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  topic_slug TEXT NOT NULL,
  oxygen_level INT DEFAULT 100 NOT NULL,
  flame_on BOOLEAN DEFAULT TRUE NOT NULL,
  last_trigger TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(student_id, topic_slug)
);

-- AI Knowledge Base (Phase 5)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.topic_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(384), -- Dimension for all-MiniLM-L6-v2
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION match_topic_embeddings (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_topic_id UUID
)
RETURNS TABLE (
  id UUID,
  topic_id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    te.id,
    te.topic_id,
    te.content,
    te.metadata,
    1 - (te.embedding <=> query_embedding) AS similarity
  FROM topic_embeddings te
  WHERE te.topic_id = p_topic_id
    AND 1 - (te.embedding <=> query_embedding) > match_threshold
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
