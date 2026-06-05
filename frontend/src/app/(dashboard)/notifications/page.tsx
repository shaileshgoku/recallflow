"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, BookOpen, Flame, Award, Clock } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import type { Notification, NotificationsResponse } from "@/types";

const typeIcons: Record<string, typeof Bell> = {
  revision_reminder: BookOpen,
  streak: Flame,
  achievement: Award,
};

const typeColors: Record<string, string> = {
  revision_reminder: "var(--color-neon-cyan)",
  streak: "var(--color-neon-orange)",
  achievement: "var(--color-neon-green)",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsAPI.list() as NotificationsResponse;
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">Notifications</span></h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={48} className="mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No notifications</h3>
          <p style={{ color: "var(--color-text-secondary)" }}>You&apos;ll see revision reminders and achievements here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type] || Bell;
            const color = typeColors[notif.type] || "var(--color-text-secondary)";
            return (
              <motion.div key={notif.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-4 flex items-start gap-4 cursor-pointer"
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                style={{ opacity: notif.read ? 0.6 : 1 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: `${color}15`,
                }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>{notif.title}</h4>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-neon-cyan)" }} />
                    )}
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{notif.message}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                    <Clock size={10} />
                    {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
