"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Brain, TrendingUp, Target, Flame, BookOpen,
  AlertTriangle, CheckCircle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { analyticsAPI } from "@/lib/api";
import type { OverviewStats, HeatmapDay, DailyAccuracy } from "@/types";

const CHART_COLORS = ["#00f5ff", "#b000ff", "#ff00e5", "#39ff14", "#ff6b00", "#4361ee"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [dailyAccuracy, setDailyAccuracy] = useState<DailyAccuracy[]>([]);
  const [diffDist, setDiffDist] = useState<Record<string, number>>({});
  const [weakTopics, setWeakTopics] = useState<{ id: string; title: string; memory_strength: number; difficulty: string }[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category_name: string; category_color: string; topic_count: number; avg_memory_strength: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [ov, hm, da, dd, wt, cb] = await Promise.all([
        analyticsAPI.overview(),
        analyticsAPI.heatmap(365),
        analyticsAPI.dailyAccuracy(30),
        analyticsAPI.difficultyDistribution(),
        analyticsAPI.weakTopics(),
        analyticsAPI.categoryBreakdown(),
      ]);
      setOverview(ov as OverviewStats);
      setHeatmap(hm as HeatmapDay[]);
      setDailyAccuracy(da as DailyAccuracy[]);
      setDiffDist(dd as Record<string, number>);
      setWeakTopics(wt as typeof weakTopics);
      setCategoryBreakdown(cb as typeof categoryBreakdown);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  const ov = overview || {
    total_topics: 0, topics_mastered: 0, total_revisions: 0,
    revisions_completed: 0, revisions_pending_today: 0,
    average_memory_strength: 0, current_streak: 0, longest_streak: 0,
    total_recall_sessions: 0, recall_accuracy: 0,
  };

  const diffData = Object.entries(diffDist).map(([name, value]) => ({ name, value }));

  const tooltipStyle = {
    contentStyle: {
      background: "#16162a",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      color: "#e8e8f0",
      fontSize: 12,
    },
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold"><span className="gradient-text">Analytics</span></h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Your learning insights and performance metrics
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Target, label: "Retention", value: `${Math.round(ov.recall_accuracy)}%`, color: "var(--color-neon-cyan)" },
          { icon: BookOpen, label: "Mastered", value: `${ov.topics_mastered}/${ov.total_topics}`, color: "var(--color-neon-green)" },
          { icon: Flame, label: "Streak", value: `${ov.current_streak} days`, color: "var(--color-neon-orange)" },
          { icon: Brain, label: "Sessions", value: ov.total_recall_sessions, color: "var(--color-neon-purple)" },
          { icon: TrendingUp, label: "Avg Strength", value: `${ov.average_memory_strength}%`, color: "var(--color-neon-magenta)" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Daily Recall Accuracy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            <TrendingUp size={18} className="inline mr-2" style={{ color: "var(--color-neon-cyan)" }} />
            Daily Recall Accuracy
          </h3>
          {dailyAccuracy.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyAccuracy}>
                <defs>
                  <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(val: string) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="accuracy" stroke="#00f5ff" fill="url(#accuracyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Complete recall sessions to see accuracy data</p>
            </div>
          )}
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            <BarChart3 size={18} className="inline mr-2" style={{ color: "var(--color-neon-purple)" }} />
            Difficulty Distribution
          </h3>
          {diffData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={diffData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {diffData.map((_, index) => (
                      <Cell key={index} fill={
                        diffData[index].name === "easy" ? "#39ff14" :
                        diffData[index].name === "medium" ? "#ffaa00" : "#ff3366"
                      } />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {diffData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{
                      background: d.name === "easy" ? "#39ff14" : d.name === "medium" ? "#ffaa00" : "#ff3366",
                    }} />
                    <span className="text-sm capitalize" style={{ color: "var(--color-text-secondary)" }}>{d.name}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Add topics to see distribution</p>
            </div>
          )}
        </motion.div>

        {/* Category Breakdown */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            <BookOpen size={18} className="inline mr-2" style={{ color: "var(--color-neon-green)" }} />
            Category Breakdown
          </h3>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category_name" tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555570", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="topic_count" radius={[4, 4, 0, 0]}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.category_color || CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Categorize topics to see breakdown</p>
            </div>
          )}
        </motion.div>

        {/* Weak Topics */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            <AlertTriangle size={18} className="inline mr-2" style={{ color: "var(--color-warning)" }} />
            Weak Topics
          </h3>
          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.slice(0, 5).map((topic) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{
                      background: topic.difficulty === "easy" ? "var(--color-neon-green)" :
                        topic.difficulty === "hard" ? "var(--color-danger)" : "var(--color-warning)",
                    }} />
                    <span className="text-sm truncate" style={{ color: "var(--color-text-primary)" }}>{topic.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="w-16 h-1.5 rounded-full" style={{ background: "var(--color-bg-tertiary)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${topic.memory_strength}%`,
                        background: topic.memory_strength < 30 ? "var(--color-danger)" :
                          topic.memory_strength < 60 ? "var(--color-warning)" : "var(--color-neon-cyan)",
                      }} />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: "var(--color-text-muted)" }}>{Math.round(topic.memory_strength)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center flex-col">
              <CheckCircle size={32} className="mb-2" style={{ color: "var(--color-neon-green)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No weak topics — great work!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          <Flame size={18} className="inline mr-2" style={{ color: "var(--color-neon-orange)" }} />
          Activity Heatmap
        </h3>
        {heatmap.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {heatmap.slice(-90).map((day, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" title={`${day.date}: ${day.count} revision${day.count !== 1 ? 's' : ''}`}
                style={{
                  background: day.level === 0 ? "var(--color-bg-tertiary)" :
                    day.level === 1 ? "rgba(0, 245, 255, 0.2)" :
                    day.level === 2 ? "rgba(0, 245, 255, 0.4)" :
                    day.level === 3 ? "rgba(0, 245, 255, 0.6)" : "var(--color-neon-cyan)",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-[60px] flex items-center justify-center">
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Complete revisions to build your activity map</p>
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Less</span>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className="w-3 h-3 rounded-sm" style={{
              background: l === 0 ? "var(--color-bg-tertiary)" :
                l === 1 ? "rgba(0, 245, 255, 0.2)" :
                l === 2 ? "rgba(0, 245, 255, 0.4)" :
                l === 3 ? "rgba(0, 245, 255, 0.6)" : "var(--color-neon-cyan)",
            }} />
          ))}
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>More</span>
        </div>
      </motion.div>
    </div>
  );
}
