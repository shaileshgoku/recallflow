/* ============================================
   RecallFlow — TypeScript Type Definitions
   ============================================ */

// ── User & Auth ──

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

// ── Category ──

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
}

// ── Topic ──

export interface Topic {
  id: string;
  title: string;
  notes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  memory_strength: number;
  mastered: boolean;
  total_recalls: number;
  successful_recalls: number;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface TopicCreate {
  title: string;
  notes?: string;
  difficulty?: string;
  tags?: string[];
  category_id?: string;
  category_name?: string;
}

export interface TopicUpdate {
  title?: string;
  notes?: string;
  difficulty?: string;
  tags?: string[];
  category_id?: string;
}

export interface TopicListResponse {
  topics: Topic[];
  total: number;
  page: number;
  per_page: number;
}

// ── Revision ──

export interface Revision {
  id: string;
  topic_id: string;
  topic_title?: string;
  topic_category?: string;
  topic_difficulty?: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'pending' | 'completed' | 'missed';
  revision_number: number;
  day_interval: number;
  created_at: string;
}

export interface RevisionStats {
  total_revisions: number;
  completed: number;
  pending: number;
  missed: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
  today_count: number;
  today_completed: number;
}

export interface RevisionCalendarDay {
  date: string;
  total: number;
  completed: number;
  pending: number;
  missed: number;
}

// ── Recall ──

export interface RecallSession {
  id: string;
  topic_id: string;
  topic_title?: string;
  recall_rating: string;
  user_answer?: string;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
}

export type RecallRating = 'easy' | 'medium' | 'hard' | 'forgot';

// ── Analytics ──

export interface OverviewStats {
  total_topics: number;
  topics_mastered: number;
  total_revisions: number;
  revisions_completed: number;
  revisions_pending_today: number;
  average_memory_strength: number;
  current_streak: number;
  longest_streak: number;
  total_recall_sessions: number;
  recall_accuracy: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface CategoryBreakdown {
  category_name: string;
  category_color: string;
  topic_count: number;
  avg_memory_strength: number;
  completion_rate: number;
}

export interface DailyAccuracy {
  date: string;
  accuracy: number;
  total_sessions: number;
}

// ── Notification ──

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'revision_reminder' | 'streak' | 'achievement';
  read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
