"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 6) return { level: 1, label: "Weak", color: "var(--color-danger)" };
    if (password.length < 10) return { level: 2, label: "Fair", color: "var(--color-warning)" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNum = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    if (hasUpper && hasNum && hasSpecial) return { level: 4, label: "Strong", color: "var(--color-neon-green)" };
    return { level: 3, label: "Good", color: "var(--color-neon-cyan)" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(email, username, password, fullName || undefined);
      router.push("/dashboard");
    } catch {
      // handled by store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-grid" style={{ background: "var(--color-bg-primary)" }}>
      {/* Left Side — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(176, 0, 255, 0.08) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 70% 20%, rgba(0, 245, 255, 0.06) 0%, transparent 50%)",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center z-10 px-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, var(--color-neon-purple), var(--color-neon-magenta))",
            }}>
              <Zap size={28} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Start Learning</span>
          </h1>
          <p className="text-lg max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Join thousands of learners who never forget. Backed by cognitive science.
          </p>

          <div className="mt-12 space-y-4 max-w-sm mx-auto text-left">
            {[
              "📊 Smart spaced repetition scheduling",
              "🧠 Active recall for deep learning",
              "📈 Visual analytics & progress tracking",
              "🔥 Streak-based motivation system",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side — Register Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-purple))",
            }}>
              <Zap size={20} color="#0a0a0f" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold gradient-text">RecallFlow</span>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Create account
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Start your journey to perfect recall
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

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="input-field" style={{ paddingLeft: 48 }} id="register-name" autoComplete="new-name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); clearError(); }} placeholder="johndoe" className="input-field" style={{ paddingLeft: 48 }} required id="register-username" autoComplete="new-username" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} placeholder="you@example.com" className="input-field" style={{ paddingLeft: 48 }} required id="register-email" autoComplete="new-email" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} placeholder="••••••••" className="input-field" style={{ paddingLeft: 48, paddingRight: 48 }} required id="register-password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className="h-1 flex-1 rounded-full transition-all duration-300" style={{
                        background: level <= strength.level ? strength.color : "var(--color-bg-tertiary)",
                      }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2" id="register-submit">
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--color-neon-cyan)" }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
