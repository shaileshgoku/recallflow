/* ============================================
   RecallFlow — API Client
   ============================================ */

import { TokenResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Token Management ──

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// ── Core Fetch Wrapper ──

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data: TokenResponse = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  let token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  // If 401, try refreshing the token
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth API ──

export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    apiFetch<TokenResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiFetch('/api/auth/me'),
};

// ── Topics API ──

export const topicsAPI = {
  list: (params?: { page?: number; search?: string; difficulty?: string; category_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.search) query.set('search', params.search);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.category_id) query.set('category_id', params.category_id);
    return apiFetch(`/api/topics?${query.toString()}`);
  },

  get: (id: string) => apiFetch(`/api/topics/${id}`),

  create: (data: {
    title: string;
    notes?: string;
    difficulty?: string;
    tags?: string[];
    category_name?: string;
  }) =>
    apiFetch('/api/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/topics/${id}`, { method: 'DELETE' }),

  categories: () => apiFetch('/api/topics/categories'),
};

// ── Revisions API ──

export const revisionsAPI = {
  today: () => apiFetch('/api/revisions/today'),
  upcoming: (days?: number) =>
    apiFetch(`/api/revisions/upcoming?days=${days || 30}`),
  calendar: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    return apiFetch(`/api/revisions/calendar?${params.toString()}`);
  },
  complete: (id: string, recall_rating?: string) =>
    apiFetch(`/api/revisions/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ recall_rating }),
    }),
  stats: () => apiFetch('/api/revisions/stats'),
};

// ── Recall API ──

export const recallAPI = {
  start: (topic_id: string, revision_id?: string) =>
    apiFetch('/api/recall/start', {
      method: 'POST',
      body: JSON.stringify({ topic_id, revision_id }),
    }),

  submit: (data: {
    session_id: string;
    user_answer: string;
    recall_rating: string;
    time_spent_seconds: number;
  }) =>
    apiFetch('/api/recall/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  history: (topic_id?: string) => {
    const params = topic_id ? `?topic_id=${topic_id}` : '';
    return apiFetch(`/api/recall/history${params}`);
  },
};

// ── Analytics API ──

export const analyticsAPI = {
  overview: () => apiFetch('/api/analytics/overview'),
  heatmap: (days?: number) => apiFetch(`/api/analytics/heatmap?days=${days || 365}`),
  categoryBreakdown: () => apiFetch('/api/analytics/category-breakdown'),
  dailyAccuracy: (days?: number) => apiFetch(`/api/analytics/daily-accuracy?days=${days || 30}`),
  difficultyDistribution: () => apiFetch('/api/analytics/difficulty-distribution'),
  weakTopics: () => apiFetch('/api/analytics/weak-topics'),
  streaks: () => apiFetch('/api/analytics/streaks'),
};

// ── Notifications API ──

export const notificationsAPI = {
  list: (unread_only?: boolean) =>
    apiFetch(`/api/notifications?unread_only=${unread_only || false}`),
  markRead: (id: string) =>
    apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () =>
    apiFetch('/api/notifications/read-all', { method: 'POST' }),
};
