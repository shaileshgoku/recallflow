"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Filter, Edit3, Trash2, X,
  Tag, Clock, CheckCircle, Brain
} from "lucide-react";
import { topicsAPI } from "@/lib/api";
import type { Topic, TopicListResponse, Category } from "@/types";
import Link from "next/link";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Create/Edit form
  const [formTitle, setFormTitle] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("medium");
  const [formTags, setFormTags] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTopics();
    loadCategories();
  }, [page, search, difficultyFilter]);

  const loadTopics = async () => {
    try {
      const data = await topicsAPI.list({ page, search: search || undefined, difficulty: difficultyFilter || undefined }) as TopicListResponse;
      setTopics(data.topics);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await topicsAPI.categories() as Category[];
      setCategories(cats);
    } catch { /* ignore */ }
  };

  const openCreate = () => {
    setFormTitle(""); setFormNotes(""); setFormDifficulty("medium");
    setFormTags(""); setFormCategory(""); setEditTopic(null);
    setShowCreateModal(true);
  };

  const openEdit = (topic: Topic) => {
    setFormTitle(topic.title);
    setFormNotes(topic.notes || "");
    setFormDifficulty(topic.difficulty);
    setFormTags(topic.tags.join(", "));
    setFormCategory(topic.category?.name || "");
    setEditTopic(topic);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tags = formTags.split(",").map(t => t.trim()).filter(Boolean);
      if (editTopic) {
        await topicsAPI.update(editTopic.id, {
          title: formTitle, notes: formNotes, difficulty: formDifficulty, tags,
        });
      } else {
        await topicsAPI.create({
          title: formTitle, notes: formNotes, difficulty: formDifficulty, tags,
          category_name: formCategory || undefined,
        });
      }
      setShowCreateModal(false);
      loadTopics();
      loadCategories();
    } catch (err) {
      console.error("Failed to save topic:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    try {
      await topicsAPI.delete(id);
      loadTopics();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            <span className="gradient-text">Topics</span>
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {total} topic{total !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2" id="create-topic-btn">
          <Plus size={18} /> Add Topic
        </button>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..." className="input-field pl-11" id="topic-search"
          />
        </div>
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="select-field w-40" id="difficulty-filter">
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : topics.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4" style={{ color: "var(--color-text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No topics yet</h3>
          <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>Create your first topic to start learning with spaced repetition</p>
          <button onClick={openCreate} className="btn-primary"><Plus size={16} className="inline mr-1" /> Create Topic</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg leading-tight" style={{ color: "var(--color-text-primary)" }}>{topic.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(topic)} className="p-1.5 rounded-lg" style={{ background: "var(--color-bg-glass)" }}>
                    <Edit3 size={14} style={{ color: "var(--color-text-secondary)" }} />
                  </button>
                  <button onClick={() => handleDelete(topic.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(255,51,102,0.1)" }}>
                    <Trash2 size={14} style={{ color: "var(--color-danger)" }} />
                  </button>
                </div>
              </div>

              {topic.category && (
                <span className="text-xs px-2 py-1 rounded-full mb-2 inline-block" style={{
                  background: `${topic.category.color}15`,
                  color: topic.category.color,
                  border: `1px solid ${topic.category.color}30`,
                }}>{topic.category.name}</span>
              )}

              {topic.notes && (
                <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
                  {topic.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={`badge badge-${topic.difficulty}`}>{topic.difficulty}</span>
                {topic.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{
                    background: "var(--color-bg-glass)",
                    color: "var(--color-text-muted)",
                  }}>
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>

              {/* Memory Strength Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--color-text-muted)" }}>Memory Strength</span>
                  <span style={{ color: "var(--color-neon-cyan)" }}>{Math.round(topic.memory_strength)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${topic.memory_strength}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <Brain size={12} /> {topic.total_recalls} recalls
                  </span>
                  {topic.mastered && (
                    <span className="flex items-center gap-1" style={{ color: "var(--color-neon-green)" }}>
                      <CheckCircle size={12} /> Mastered
                    </span>
                  )}
                </div>
                <Link href={`/recall?topic=${topic.id}`} className="text-xs px-3 py-1.5 rounded-lg" style={{
                  background: "rgba(0, 245, 255, 0.1)",
                  color: "var(--color-neon-cyan)",
                }}>Recall</Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm">Previous</button>
          <span className="flex items-center px-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={topics.length < 20} className="btn-secondary px-4 py-2 text-sm">Next</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {editTopic ? "Edit Topic" : "Create Topic"}
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg" style={{ background: "var(--color-bg-glass)" }}>
                  <X size={18} style={{ color: "var(--color-text-secondary)" }} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Title *</label>
                  <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Binary Search, SQL Joins..." className="input-field" required id="topic-title" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Notes</label>
                  <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Write your notes here..." className="textarea-field" rows={4} id="topic-notes" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Difficulty</label>
                    <select value={formDifficulty} onChange={e => setFormDifficulty(e.target.value)} className="select-field" id="topic-difficulty">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Category</label>
                    <input type="text" value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g. Algorithms" className="input-field" list="categories" id="topic-category" />
                    <datalist id="categories">
                      {categories.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Tags (comma separated)</label>
                  <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="e.g. DSA, Python, LeetCode" className="input-field" id="topic-tags" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2" id="topic-submit">
                    {submitting ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Plus size={16} />}
                    {editTopic ? "Update" : "Create Topic"}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
