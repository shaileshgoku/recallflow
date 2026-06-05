"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck, ChevronLeft, ChevronRight, Check, Clock,
  AlertCircle, Brain
} from "lucide-react";
import { revisionsAPI } from "@/lib/api";
import type { Revision, RevisionStats, RevisionCalendarDay } from "@/types";
import Link from "next/link";

export default function RevisionsPage() {
  const [tab, setTab] = useState<"today" | "upcoming" | "calendar">("today");
  const [todayRevisions, setTodayRevisions] = useState<Revision[]>([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState<Revision[]>([]);
  const [stats, setStats] = useState<RevisionStats | null>(null);
  const [calendarData, setCalendarData] = useState<RevisionCalendarDay[]>([]);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab === "calendar") loadCalendar();
  }, [tab, calYear, calMonth]);

  const loadData = async () => {
    try {
      const [today, upcoming, revStats] = await Promise.all([
        revisionsAPI.today() as Promise<Revision[]>,
        revisionsAPI.upcoming(30) as Promise<Revision[]>,
        revisionsAPI.stats() as Promise<RevisionStats>,
      ]);
      setTodayRevisions(today);
      setUpcomingRevisions(upcoming);
      setStats(revStats);
    } catch (err) {
      console.error("Failed to load revisions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    try {
      const data = await revisionsAPI.calendar(calYear, calMonth) as RevisionCalendarDay[];
      setCalendarData(data);
    } catch { /* ignore */ }
  };

  const handleComplete = async (id: string) => {
    try {
      await revisionsAPI.complete(id, "medium");
      loadData();
    } catch (err) {
      console.error("Failed to complete:", err);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days = [];
    const calMap = new Map(calendarData.map(d => [d.date, d]));

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayData = calMap.get(dateStr);
      const isToday = dateStr === new Date().toISOString().split("T")[0];

      days.push(
        <div key={d} className="h-12 rounded-lg flex flex-col items-center justify-center relative" style={{
          background: isToday ? "rgba(0, 245, 255, 0.08)" : "var(--color-bg-glass)",
          border: isToday ? "1px solid var(--color-border-neon)" : "1px solid transparent",
        }}>
          <span className="text-xs font-medium" style={{
            color: isToday ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
          }}>{d}</span>
          {dayData && dayData.total > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayData.completed > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-neon-green)" }} />}
              {dayData.pending > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-neon-cyan)" }} />}
              {dayData.missed > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-danger)" }} />}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold"><span className="gradient-text">Revisions</span></h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>Track and manage your revision schedule</p>
      </motion.div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today", value: `${stats.today_completed}/${stats.today_count}`, color: "var(--color-neon-cyan)" },
            { label: "Completed", value: stats.completed, color: "var(--color-neon-green)" },
            { label: "Pending", value: stats.pending, color: "var(--color-warning)" },
            { label: "Streak", value: `${stats.current_streak} days`, color: "var(--color-neon-orange)" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "var(--color-bg-secondary)" }}>
        {(["today", "upcoming", "calendar"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all" style={{
            background: tab === t ? "var(--color-bg-card)" : "transparent",
            color: tab === t ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
            boxShadow: tab === t ? "0 0 10px rgba(0,245,255,0.1)" : "none",
          }}>
            {t === "today" ? "Today" : t === "upcoming" ? "Upcoming" : "Calendar"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "today" && (
        <div className="space-y-3">
          {todayRevisions.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Check size={48} className="mx-auto mb-4" style={{ color: "var(--color-neon-green)" }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>All caught up!</h3>
              <p style={{ color: "var(--color-text-secondary)" }}>No revisions due today</p>
            </div>
          ) : todayRevisions.map((rev, i) => (
            <motion.div key={rev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: "rgba(0, 245, 255, 0.1)",
                }}>
                  <Clock size={18} style={{ color: "var(--color-neon-cyan)" }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: "var(--color-text-primary)" }}>{rev.topic_title}</h4>
                  <p className="text-xs flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                    Revision #{rev.revision_number} · Day {rev.day_interval}
                    {rev.topic_category && <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--color-bg-glass)" }}>{rev.topic_category}</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/recall?topic=${rev.topic_id}&revision=${rev.id}`} className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                  <Brain size={14} /> Recall
                </Link>
                <button onClick={() => handleComplete(rev.id)} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1">
                  <Check size={14} /> Done
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "upcoming" && (
        <div className="space-y-3">
          {upcomingRevisions.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <CalendarCheck size={48} className="mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No upcoming revisions</h3>
              <p style={{ color: "var(--color-text-secondary)" }}>Create topics to generate revision schedules</p>
            </div>
          ) : upcomingRevisions.map((rev, i) => (
            <motion.div key={rev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: "rgba(176, 0, 255, 0.1)",
                }}>
                  <CalendarCheck size={18} style={{ color: "var(--color-neon-purple)" }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: "var(--color-text-primary)" }}>{rev.topic_title}</h4>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(rev.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}Revision #{rev.revision_number}
                  </p>
                </div>
              </div>
              <span className={`badge badge-${rev.topic_difficulty || "medium"}`}>{rev.topic_difficulty}</span>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "calendar" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }} className="btn-secondary p-2">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {monthNames[calMonth - 1]} {calYear}
            </h3>
            <button onClick={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} className="btn-secondary p-2">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs font-medium py-2" style={{ color: "var(--color-text-muted)" }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          <div className="flex gap-4 mt-4 justify-center">
            {[
              { label: "Completed", color: "var(--color-neon-green)" },
              { label: "Pending", color: "var(--color-neon-cyan)" },
              { label: "Missed", color: "var(--color-danger)" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
