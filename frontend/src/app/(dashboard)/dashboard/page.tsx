"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, CalendarCheck, Brain, Flame, Target, TrendingUp,
  ChevronRight, AlertTriangle, Zap, Clock
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { analyticsAPI, revisionsAPI } from "@/lib/api";
import type { OverviewStats, Revision } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [todayRevisions, setTodayRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overview, today] = await Promise.all([
        analyticsAPI.overview() as Promise<OverviewStats>,
        revisionsAPI.today() as Promise<Revision[]>,
      ]);
      setStats(overview);
      setTodayRevisions(today);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  const s = stats || {
    total_topics: 0, topics_mastered: 0, total_revisions: 0,
    revisions_completed: 0, revisions_pending_today: 0,
    average_memory_strength: 0, current_streak: 0, longest_streak: 0,
    total_recall_sessions: 0, recall_accuracy: 0,
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {greeting()}, <span className="gradient-text">{user?.username || "Learner"}</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          {s.revisions_pending_today > 0
            ? `You have ${s.revisions_pending_today} revision${s.revisions_pending_today > 1 ? "s" : ""} due today. Let's go!`
            : "You're all caught up! Great work."
          }
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Today's Revisions — Wide Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 col-span-1 md:col-span-2 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: "rgba(0, 245, 255, 0.1)",
              }}>
                <CalendarCheck size={20} style={{ color: "var(--color-neon-cyan)" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Today&apos;s Revisions</h3>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.revisions_pending_today} pending</p>
              </div>
            </div>
            <Link href="/revisions" className="text-sm flex items-center gap-1" style={{ color: "var(--color-neon-cyan)" }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {todayRevisions.length === 0 ? (
            <div className="text-center py-8">
              <Target size={32} className="mx-auto mb-3" style={{ color: "var(--color-text-muted)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>No revisions due today!</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Create topics to start your learning journey</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todayRevisions.slice(0, 5).map((rev) => (
                <div key={rev.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "var(--color-bg-glass)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{
                      background: rev.topic_difficulty === "easy" ? "var(--color-neon-green)" :
                        rev.topic_difficulty === "hard" ? "var(--color-danger)" : "var(--color-warning)",
                    }} />
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {rev.topic_title}
                    </span>
                    {rev.topic_category && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: "var(--color-bg-tertiary)",
                        color: "var(--color-text-muted)",
                      }}>
                        {rev.topic_category}
                      </span>
                    )}
                  </div>
                  <Link href={`/recall?topic=${rev.topic_id}&revision=${rev.id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Brain size={12} /> Recall
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 animate-float" style={{
            background: "linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 51, 102, 0.2))",
          }}>
            <Flame size={32} style={{ color: "var(--color-neon-orange)" }} />
          </div>
          <p className="text-4xl font-bold" style={{ color: "var(--color-neon-orange)" }}>
            {s.current_streak}
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Day Streak</p>
          <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
            Best: {s.longest_streak} days
          </p>
        </motion.div>

        {/* Memory Strength Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center"
        >
          <div className="relative w-20 h-20 mb-3">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="url(#gradient-gauge)"
                strokeWidth="3"
                strokeDasharray={`${s.average_memory_strength * 0.94} 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient-gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-neon-cyan)" />
                  <stop offset="100%" stopColor="var(--color-neon-purple)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: "var(--color-neon-cyan)" }}>
              {Math.round(s.average_memory_strength)}%
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Memory Strength</p>
        </motion.div>

        {/* Quick Stats Cards */}
        {[
          { icon: BookOpen, label: "Topics", value: s.total_topics, sub: `${s.topics_mastered} mastered`, color: "var(--color-neon-purple)", bgColor: "rgba(176, 0, 255, 0.1)" },
          { icon: CalendarCheck, label: "Revisions", value: s.revisions_completed, sub: `of ${s.total_revisions} total`, color: "var(--color-neon-cyan)", bgColor: "rgba(0, 245, 255, 0.1)" },
          { icon: Brain, label: "Recall Sessions", value: s.total_recall_sessions, sub: `${s.recall_accuracy}% accuracy`, color: "var(--color-neon-magenta)", bgColor: "rgba(255, 0, 229, 0.1)" },
          { icon: TrendingUp, label: "Completion Rate", value: `${Math.round((s.total_revisions > 0 ? s.revisions_completed / s.total_revisions * 100 : 0))}%`, sub: "revision completion", color: "var(--color-neon-green)", bgColor: "rgba(57, 255, 20, 0.1)" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: card.bgColor }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>{card.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{card.sub}</p>
          </motion.div>
        ))}

        {/* Quick Start Recall — Wide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 opacity-20" style={{
            background: "radial-gradient(circle, var(--color-neon-cyan), transparent)",
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={24} style={{ color: "var(--color-neon-cyan)" }} />
              <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Quick Actions</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
              Jump into learning or manage your study materials
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/topics" className="btn-primary flex items-center gap-2">
                <BookOpen size={16} /> Add Topic
              </Link>
              <Link href="/recall" className="btn-secondary flex items-center gap-2">
                <Brain size={16} /> Start Recall
              </Link>
              <Link href="/analytics" className="btn-secondary flex items-center gap-2">
                <TrendingUp size={16} /> View Analytics
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Weak Topics Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-card p-6 col-span-1 md:col-span-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: "rgba(255, 170, 0, 0.1)",
            }}>
              <AlertTriangle size={20} style={{ color: "var(--color-warning)" }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Needs Attention</h3>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Topics with low memory strength</p>
            </div>
          </div>
          {s.total_topics === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No topics yet. <Link href="/topics" style={{ color: "var(--color-neon-cyan)" }}>Create your first topic</Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {["Start by creating topics and", "completing your first revision!"].map((text, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{
                  background: "var(--color-bg-glass)",
                  color: "var(--color-text-secondary)",
                }}>
                  {text}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
