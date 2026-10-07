"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Zap,
  PlayCircle,
  AlertCircle,
  Clock,
  Target,
  ChevronRight,
  ShieldCheck,
  Filter,
  BarChart2
} from "lucide-react";
import { MistakeEntry, MISTAKE_REASONS, MistakeReason } from "@/lib/data/mistake-book";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";

export default function MistakeBookPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<"All" | "Physics" | "Chemistry" | "Biology">("All");
  const [activeReasonFilter, setActiveReasonFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);

  // Fetch mistakes from API
  useEffect(() => {
    async function loadMistakes() {
      try {
        const res = await fetch("/api/mistakes");
        if (res.ok) {
          const data = await res.json();
          if (data.mistakes) {
            setMistakes(data.mistakes);
          }
        }
      } catch (err) {
        console.error("Failed to load mistakes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMistakes();
  }, []);

  // Update classification reason
  const handleClassify = async (mistakeId: string, reason: MistakeReason) => {
    setUpdatingId(mistakeId);
    try {
      const res = await fetch("/api/mistakes/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mistakeId, reason }),
      });
      if (res.ok) {
        setMistakes((prev) =>
          prev.map((m) => (m.id === mistakeId ? { ...m, reason } : m))
        );
      }
    } catch (err) {
      console.error("Failed to update classification:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered mistakes
  const filteredMistakes = mistakes.filter((m) => {
    const matchesSubject = activeSubject === "All" || m.subject === activeSubject;
    const matchesReason = activeReasonFilter === "all" || m.reason === activeReasonFilter;
    return matchesSubject && matchesReason;
  });

  const totalCount = mistakes.length;
  const phyCount = mistakes.filter((m) => m.subject === "Physics").length;
  const chemCount = mistakes.filter((m) => m.subject === "Chemistry").length;
  const bioCount = mistakes.filter((m) => m.subject === "Biology").length;

  // Handle Practice Mistakes Test Generation
  const handleLaunchPracticeTest = () => {
    // Generate specialized practice session targeting mistake questions
    router.push(`/practice?mode=mistakes&subject=${encodeURIComponent(activeSubject)}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP HEADER */}
      <header className="bg-[#06382c] text-white px-4 sm:px-8 py-4 border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 bg-emerald-900/60 hover:bg-emerald-800 rounded-xl text-emerald-200 transition"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-8 w-8 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">NEETora Mistake Book</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                  Auto-Collector
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 block">
                Targeted Error Remediation & Negative Mark Eliminator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/analytics"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-800 hover:bg-emerald-800/60 transition"
            >
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attempt DNA</span>
            </Link>

            <button
              type="button"
              onClick={handleLaunchPracticeTest}
              disabled={filteredMistakes.length === 0}
              className="py-2 px-4 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 transform active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Mistakes ({filteredMistakes.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6">
        
        {/* Banner with Metrics */}
        <div className="bg-gradient-to-r from-[#06382c] via-[#0b5443] to-[#124235] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Negative Mark Diagnoser</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Your Personalized Mistake Book
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mt-1 leading-relaxed">
                  Every incorrect response in full mocks is automatically catalogued here. Classify each mistake reason below to eliminate negative marks before the real exam.
                </p>
              </div>

              {/* Action Banner */}
              <div className="bg-emerald-950/60 border border-emerald-700/60 p-4 rounded-2xl flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Mistakes</span>
                  <span className="text-2xl font-black text-rose-400 font-mono">{totalCount}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">-{totalCount} Marks Incurred</span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchPracticeTest}
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Practice Now</span>
                </button>
              </div>
            </div>

            {/* Subject Breakdown Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-800/60">
              <div
                onClick={() => setActiveSubject("All")}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeSubject === "All"
                    ? "bg-white text-slate-950 border-white shadow-md font-bold"
                    : "bg-emerald-900/30 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/50"
                }`}
              >
                <span className="text-[10px] uppercase block">All Mistakes</span>
                <span className="text-lg font-black">{totalCount} Questions</span>
              </div>

              <div
                onClick={() => setActiveSubject("Physics")}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeSubject === "Physics"
                    ? "bg-white text-slate-950 border-white shadow-md font-bold"
                    : "bg-emerald-900/30 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/50"
                }`}
              >
                <span className="text-[10px] uppercase block text-sky-400">Physics</span>
                <span className="text-lg font-black">{phyCount} Questions</span>
              </div>

              <div
                onClick={() => setActiveSubject("Chemistry")}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeSubject === "Chemistry"
                    ? "bg-white text-slate-950 border-white shadow-md font-bold"
                    : "bg-emerald-900/30 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/50"
                }`}
              >
                <span className="text-[10px] uppercase block text-amber-400">Chemistry</span>
                <span className="text-lg font-black">{chemCount} Questions</span>
              </div>

              <div
                onClick={() => setActiveSubject("Biology")}
                className={`p-3 rounded-2xl border cursor-pointer transition ${
                  activeSubject === "Biology"
                    ? "bg-white text-slate-950 border-white shadow-md font-bold"
                    : "bg-emerald-900/30 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/50"
                }`}
              >
                <span className="text-[10px] uppercase block text-emerald-300">Biology</span>
                <span className="text-lg font-black">{bioCount} Questions</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. CLASSIFICATION FILTER BAR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Filter By Reason:</span>
            <select
              value={activeReasonFilter}
              onChange={(e) => setActiveReasonFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Classification Reasons</option>
              {MISTAKE_REASONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500">
            Showing <strong className="text-slate-900">{filteredMistakes.length}</strong> of {totalCount} mistakes
          </div>
        </div>

        {/* 4. MISTAKE LIST CARDS */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading your diagnostic mistakes...</p>
          </div>
        ) : filteredMistakes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">No Mistakes Found in This Category!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                You have no recorded errors matching this filter. Take a new CBT mock test to stress-test your knowledge.
              </p>
            </div>
            <Link
              href="/exam"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#06382c] hover:bg-[#084a3b] text-white text-xs font-bold uppercase rounded-xl transition"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch NEET Mock Test</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMistakes.map((m, index) => {
              const currentReasonConfig = MISTAKE_REASONS.find((r) => r.key === m.reason);

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm transition p-5 space-y-4"
                >
                  {/* Card Header: Subject, Chapter & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {m.subject}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {m.chapterName}
                      </span>
                      {m.topicName && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400">{m.topicName}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        {m.sourceExamTitle}
                      </span>
                      {currentReasonConfig && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${currentReasonConfig.badgeClass}`}>
                          <span>{currentReasonConfig.icon}</span>
                          <span>{currentReasonConfig.label}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <KaTeXRenderer content={m.questionText} />
                  </div>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {m.options.map((opt) => {
                      const isCorrect = opt.key === m.correctOption;
                      const isStudentSelected = opt.key === m.selectedOption;

                      let optClass = "bg-white border-slate-200 text-slate-700";
                      if (isCorrect) {
                        optClass = "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300";
                      } else if (isStudentSelected) {
                        optClass = "bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-300";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 ${optClass}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : isStudentSelected
                                ? "bg-rose-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1">
                            <KaTeXRenderer content={opt.text} />
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isStudentSelected && !isCorrect && (
                            <span className="text-[10px] font-bold text-rose-700 shrink-0">
                              ✗ Marked by You (-1)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution */}
                  {m.explanation && (
                    <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-slate-800 space-y-1">
                      <span className="font-bold text-[11px] text-emerald-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> NCERT High-Yield Explanation
                      </span>
                      <div className="text-slate-700 text-xs leading-relaxed">
                        <KaTeXRenderer content={m.explanation} />
                      </div>
                    </div>
                  )}

                  {/* MISTAKE CLASSIFICATION SELECTOR */}
                  <div className="pt-3 border-t border-slate-100 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                        Why did you get this wrong?
                      </span>
                      {updatingId === m.id && (
                        <span className="text-[10px] text-emerald-700 font-semibold animate-pulse">
                          Saving diagnosis...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                      {MISTAKE_REASONS.map((r) => {
                        const isSelected = m.reason === r.key;
                        return (
                          <button
                            type="button"
                            key={r.key}
                            onClick={() => handleClassify(m.id, r.key)}
                            className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <span className="text-sm mb-1">{r.icon}</span>
                            <span className="text-[11px] font-bold leading-tight block">{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}
