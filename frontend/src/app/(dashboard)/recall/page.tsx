"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Brain, Eye, EyeOff, Clock, CheckCircle, AlertTriangle,
  X, ArrowRight, Sparkles, Zap, RotateCcw
} from "lucide-react";
import { recallAPI, topicsAPI, revisionsAPI } from "@/lib/api";
import type { Topic, Revision, RecallSession } from "@/types";

function RecallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topicId = searchParams.get("topic");
  const revisionId = searchParams.get("revision");

  const [phase, setPhase] = useState<"select" | "recall" | "reveal" | "rate" | "summary">("select");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [session, setSession] = useState<RecallSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadTopics();
    if (topicId) {
      startWithTopic(topicId);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicsAPI.list({ per_page: 100 } as Parameters<typeof topicsAPI.list>[0]) as { topics: Topic[] };
      setTopics(data.topics);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const startWithTopic = async (tId: string) => {
    try {
      const topic = await topicsAPI.get(tId) as Topic;
      setCurrentTopic(topic);
      const sess = await recallAPI.start(tId, revisionId || undefined) as RecallSession;
      setSession(sess);
      setPhase("recall");
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      console.error("Failed to start recall:", err);
    }
  };

  const handleReveal = () => {
    setShowNotes(true);
    setPhase("reveal");
  };

  const handleRate = async (rating: string) => {
    if (!session || submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await recallAPI.submit({
        session_id: session.id,
        user_answer: answer,
        recall_rating: rating,
        time_spent_seconds: timer,
      });
      setPhase("summary");
    } catch (err) {
      console.error("Failed to submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const ratingOptions = [
    { value: "easy", label: "Easy", emoji: "😊", desc: "Recalled perfectly", color: "var(--color-neon-green)", bg: "rgba(57, 255, 20, 0.1)" },
    { value: "medium", label: "Medium", emoji: "🤔", desc: "Recalled with effort", color: "var(--color-warning)", bg: "rgba(255, 170, 0, 0.1)" },
    { value: "hard", label: "Hard", emoji: "😓", desc: "Partially recalled", color: "var(--color-neon-orange)", bg: "rgba(255, 107, 0, 0.1)" },
    { value: "forgot", label: "Forgot", emoji: "😵", desc: "Couldn't recall", color: "var(--color-danger)", bg: "rgba(255, 51, 102, 0.1)" },
  ];

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold"><span className="gradient-text">Active Recall</span></h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>Test your memory and strengthen neural pathways</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* SELECT TOPIC PHASE */}
        {phase === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-4">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Choose a topic to recall
              </h2>
              {topics.length === 0 ? (
                <div className="text-center py-8">
                  <Brain size={48} className="mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
                  <p style={{ color: "var(--color-text-muted)" }}>No topics to recall. Create some first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topics.map((topic) => (
                    <button key={topic.id} onClick={() => startWithTopic(topic.id)}
                      className="glass-card p-4 text-left hover:border-[rgba(0,245,255,0.3)] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium" style={{ color: "var(--color-text-primary)" }}>{topic.title}</h3>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-neon-cyan)" }} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`badge badge-${topic.difficulty} text-xs`}>{topic.difficulty}</span>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{Math.round(topic.memory_strength)}% strength</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RECALL PHASE */}
        {phase === "recall" && currentTopic && (
          <motion.div key="recall" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{
                background: "linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-purple))",
              }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-neon-pulse" style={{
                    background: "rgba(176, 0, 255, 0.15)",
                  }}>
                    <Brain size={20} style={{ color: "var(--color-neon-purple)" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>{currentTopic.title}</h2>
                    <span className={`badge badge-${currentTopic.difficulty} text-xs`}>{currentTopic.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-mono px-3 py-1.5 rounded-lg" style={{
                    background: "var(--color-bg-glass)",
                    color: "var(--color-neon-cyan)",
                  }}>
                    <Clock size={14} /> {formatTime(timer)}
                  </span>
                  <button onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase("select"); }}
                    className="p-2 rounded-lg" style={{ background: "var(--color-bg-glass)" }}>
                    <X size={18} style={{ color: "var(--color-text-muted)" }} />
                  </button>
                </div>
              </div>

              {/* Question Area */}
              <div className="mb-6 p-6 rounded-xl text-center" style={{ background: "var(--color-bg-secondary)" }}>
                <Sparkles size={24} className="mx-auto mb-3" style={{ color: "var(--color-neon-cyan)" }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                  What do you remember about:
                </h3>
                <p className="text-2xl font-bold neon-text-cyan">{currentTopic.title}</p>
                <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Write everything you can recall from memory
                </p>
              </div>

              {/* Answer Input */}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer from memory..."
                className="textarea-field mb-4"
                rows={6}
                autoFocus
                id="recall-answer"
              />

              {/* Notes (hidden) */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff size={16} style={{ color: "var(--color-text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Original notes are hidden</span>
                </div>
                <div className="p-4 rounded-xl text-center" style={{
                  background: "var(--color-bg-glass)",
                  border: "1px dashed var(--color-border-subtle)",
                }}>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Click &quot;Reveal Notes&quot; when you&apos;re ready to compare
                  </p>
                </div>
              </div>

              <button onClick={handleReveal} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg" id="reveal-notes-btn">
                <Eye size={20} /> Reveal Notes & Compare
              </button>
            </div>
          </motion.div>
        )}

        {/* REVEAL PHASE */}
        {phase === "reveal" && currentTopic && (
          <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-8">
              <div className="absolute top-0 left-0 right-0 h-1" style={{
                background: "linear-gradient(90deg, var(--color-neon-green), var(--color-neon-cyan))",
              }} />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>{currentTopic.title}</h2>
                <span className="text-sm font-mono" style={{ color: "var(--color-neon-cyan)" }}>{formatTime(timer)}</span>
              </div>

              {/* Your Answer */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-neon-purple)" }}>
                  <Brain size={16} /> Your Answer
                </h4>
                <div className="p-4 rounded-xl" style={{ background: "rgba(176, 0, 255, 0.05)", border: "1px solid rgba(176, 0, 255, 0.15)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>
                    {answer || <span style={{ color: "var(--color-text-muted)" }}>No answer provided</span>}
                  </p>
                </div>
              </div>

              {/* Original Notes */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-neon-green)" }}>
                  <Eye size={16} /> Original Notes
                </h4>
                <div className="p-4 rounded-xl" style={{ background: "rgba(57, 255, 20, 0.05)", border: "1px solid rgba(57, 255, 20, 0.15)" }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>
                    {currentTopic.notes || "No notes saved for this topic"}
                  </p>
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6">
                <h4 className="text-sm font-semibold mb-3 text-center" style={{ color: "var(--color-text-secondary)" }}>
                  How well did you recall?
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ratingOptions.map((opt) => (
                    <button key={opt.value} onClick={() => handleRate(opt.value)} disabled={submitting}
                      className="p-4 rounded-xl text-center transition-all hover:scale-105"
                      style={{ background: opt.bg, border: `1px solid ${opt.color}30` }}
                    >
                      <span className="text-2xl block mb-1">{opt.emoji}</span>
                      <span className="text-sm font-semibold block" style={{ color: opt.color }}>{opt.label}</span>
                      <span className="text-xs block mt-1" style={{ color: "var(--color-text-muted)" }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* SUMMARY PHASE */}
        {phase === "summary" && currentTopic && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-card p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <CheckCircle size={64} className="mx-auto mb-4" style={{ color: "var(--color-neon-green)" }} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Recall Complete! 🎉
              </h2>
              <p className="mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Great work on &quot;{currentTopic.title}&quot;
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                Time spent: {formatTime(timer)}
              </p>

              <div className="flex gap-3 justify-center">
                <button onClick={() => { setPhase("select"); setAnswer(""); setShowNotes(false); setTimer(0); }}
                  className="btn-primary flex items-center gap-2">
                  <RotateCcw size={16} /> Recall Another
                </button>
                <button onClick={() => router.push("/dashboard")} className="btn-secondary flex items-center gap-2">
                  <Zap size={16} /> Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RecallPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]"><div className="spinner" /></div>}>
      <RecallContent />
    </Suspense>
  );
}
