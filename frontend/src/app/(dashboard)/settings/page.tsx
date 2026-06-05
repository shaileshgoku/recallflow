"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, LogOut, Save, Moon, Sun } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    browser: true,
    email: false,
    dailyReminder: true,
    streakAlerts: true,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold"><span className="gradient-text">Settings</span></h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>Manage your account and preferences</p>
      </motion.div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  background: activeTab === tab.id ? "rgba(0, 245, 255, 0.08)" : "transparent",
                  color: activeTab === tab.id ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
                }}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>Profile Settings</h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold" style={{
                  background: "linear-gradient(135deg, var(--color-neon-purple), var(--color-neon-magenta))",
                  color: "#fff",
                }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{user?.username}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Username</label>
                  <input type="text" defaultValue={user?.username} className="input-field" id="settings-username" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Full Name</label>
                  <input type="text" defaultValue={user?.full_name || ""} className="input-field" id="settings-fullname" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Email</label>
                  <input type="email" defaultValue={user?.email} className="input-field" disabled />
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "browser", label: "Browser Notifications", desc: "Get push notifications for revision reminders" },
                  { key: "email", label: "Email Notifications", desc: "Receive daily digest emails (coming soon)" },
                  { key: "dailyReminder", label: "Daily Reminder", desc: "Get reminded to study every day" },
                  { key: "streakAlerts", label: "Streak Alerts", desc: "Get notified when your streak is at risk" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--color-bg-glass)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className="w-11 h-6 rounded-full transition-all relative"
                      style={{
                        background: notifications[item.key as keyof typeof notifications] ? "var(--color-neon-cyan)" : "var(--color-bg-tertiary)",
                      }}
                    >
                      <div className="w-4 h-4 rounded-full absolute top-1 transition-all" style={{
                        background: "#fff",
                        left: notifications[item.key as keyof typeof notifications] ? 24 : 4,
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>Appearance</h2>
              <div className="flex gap-4">
                <button onClick={() => setDarkMode(true)}
                  className="flex-1 p-4 rounded-xl text-center transition-all"
                  style={{
                    background: darkMode ? "rgba(0, 245, 255, 0.08)" : "var(--color-bg-glass)",
                    border: darkMode ? "1px solid var(--color-border-neon)" : "1px solid var(--color-border-subtle)",
                  }}
                >
                  <Moon size={24} className="mx-auto mb-2" style={{ color: darkMode ? "var(--color-neon-cyan)" : "var(--color-text-muted)" }} />
                  <p className="text-sm font-medium" style={{ color: darkMode ? "var(--color-neon-cyan)" : "var(--color-text-secondary)" }}>Dark Mode</p>
                </button>
                <button onClick={() => setDarkMode(false)}
                  className="flex-1 p-4 rounded-xl text-center transition-all"
                  style={{
                    background: !darkMode ? "rgba(0, 245, 255, 0.08)" : "var(--color-bg-glass)",
                    border: !darkMode ? "1px solid var(--color-border-neon)" : "1px solid var(--color-border-subtle)",
                  }}
                >
                  <Sun size={24} className="mx-auto mb-2" style={{ color: !darkMode ? "var(--color-neon-cyan)" : "var(--color-text-muted)" }} />
                  <p className="text-sm font-medium" style={{ color: !darkMode ? "var(--color-neon-cyan)" : "var(--color-text-secondary)" }}>Light Mode</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Coming soon</p>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Current Password</label>
                    <input type="password" className="input-field" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>New Password</label>
                    <input type="password" className="input-field" placeholder="••••••••" />
                  </div>
                  <button className="btn-primary flex items-center gap-2"><Save size={16} /> Update Password</button>
                </div>
              </div>

              <div className="glass-card p-6" style={{ borderColor: "rgba(255, 51, 102, 0.2)" }}>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-danger)" }}>Danger Zone</h2>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>Permanently delete your account and all data</p>
                <button className="btn-danger flex items-center gap-2" onClick={logout}>
                  <LogOut size={16} /> Delete Account
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
