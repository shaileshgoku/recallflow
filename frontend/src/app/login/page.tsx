"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      // Error is handled by the store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-grid" style={{ background: "var(--color-bg-primary)" }}>
      {/* Left Side — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(0, 245, 255, 0.08) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 70% 80%, rgba(176, 0, 255, 0.06) 0%, transparent 50%)",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center z-10 px-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))",
            }}>
              <Zap size={28} color="#0a0a0f" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">RecallFlow</span>
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Master any topic with AI-powered spaced repetition and active recall. Never forget what you learn.
          </p>

          {/* Floating Stats */}
          <div className="mt-12 flex gap-6 justify-center">
            {[
              { label: "Retention Rate", value: "94%" },
              { label: "Study Efficiency", value: "3x" },
              { label: "Topics Mastered", value: "∞" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-card px-5 py-3 text-center"
              >
                <p className="text-xl font-bold neon-text-cyan">{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))",
            }}>
              <Zap size={20} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold gradient-text">RecallFlow</span>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Welcome back
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Sign in to continue your learning journey
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(255, 51, 102, 0.1)",
                border: "1px solid rgba(255, 51, 102, 0.2)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@example.com"
                  className="input-field"
                  style={{ paddingLeft: 48 }}
                  required
                  id="login-email"
/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: 48, paddingRight: 48 }}
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              id="login-submit"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--color-neon-cyan)" }}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
