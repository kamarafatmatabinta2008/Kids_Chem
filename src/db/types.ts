// Minimal TypeScript interfaces for DB entities (Phase 1-4)
export type UserRole = 'parent' | 'teacher' | 'student';
export type ScienceTier = 'PRIMARY' | 'JSS';
export type ScienceSubject = 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS';
export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED';

export interface Profile {
  id: string;
  phone_number: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  parent_id: string;
  full_name: string;
  tier: ScienceTier;
  targeted_weakness?: ScienceSubject;
  continuous_streak_days: number;
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  parent_id: string;
  is_pro_active: boolean;
  tier_price_leones: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface MonimeTransaction {
  id: string;
  parent_id: string;
  subscription_id?: string;
  amount: number;
  phone_number: string;
  monime_reference: string;
  status: PaymentStatus;
  webhook_raw_payload?: Record<string, any>;
  created_at: string;
}

export interface Topic {
  id: string;
  subject: ScienceSubject;
  tier: ScienceTier;
  title: string;
  slug: string;
  textbook_source: string;
  raw_textbook_excerpt: string;
  simplified_150_story: string;
  lab_matrix_config: Record<string, any>;
  video_cdn_url?: string;
  sort_order: number;
}

export interface Quiz {
  id: string;
  topic_id: string;
  passing_score: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: Record<string, any>;
  correct_option: string;
  explanations_from_textbook: string;
}

export interface QuizAttempt {
  id: string;
  student_id: string;
  quiz_id: string;
  question_id: string;
  selected_option: string;
  is_correct: boolean;
  attempt_iteration: number;
  created_at: string;
}
