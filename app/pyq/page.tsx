"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Clock,
  Target,
  BarChart2,
  Filter,
  CheckCircle2,
  HelpCircle,
  PlayCircle,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { PyqQuestion, PyqHeatmapTopic } from "@/lib/data/pyq-intelligence";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";

export default function PyqIntelligencePage() {
  const [questions, setQuestions] = useState<PyqQuestion[]>([]);
  const [heatmap, setHeatmap] = useState<PyqHeatmapTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/pyq");
        if (res.ok) {
          const data = await res.json();
          if (data.questions) setQuestions(data.questions);
          if (data.heatmap) setHeatmap(data.heatmap);
        }
      } catch (err) {
        console.error("Failed to load PYQ intelligence", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesYear = selectedYear === "All" || q.year.toString() === selectedYear;
    const matchesSubject = selectedSubject === "All" || q.subject === selectedSubject;
    const matchesDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    return matchesYear && matchesSubject && matchesDiff;
  });

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
            <div className="h-8 w-8 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
              <Flame className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">PYQ Intelligence Engine</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-full">
                  Official NTA Authentic Bank
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 block">
                Previous Years Trends, Difficulty Analytics & Weightage Heatmap
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/practice"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Practice</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8">
        
        {/* HERO BANNER & HEATMAP INTRO */}
        <div className="bg-gradient-to-br from-[#06382c] via-[#094738] to-[#04241c] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-700/60">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Calibrated for NEET 2027 & 2028 Aspirants</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  High-Yield PYQ Intelligence
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mt-1 leading-relaxed">
                  Every past NEET question calibrated with real student telemetry — attempts, actual accuracy percentages, and average solution speed.
                </p>
              </div>

              <div className="p-4 bg-emerald-950/70 border border-emerald-600/50 rounded-2xl flex items-center gap-4 text-center shrink-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">PYQ Database</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">10+ Years</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">NTA Exact Telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PYQ HEATMAP (HIGH YIELD FREQUENCY: 🔥🔥🔥) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                Historical Frequency Ranking
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                PYQ High-Yield Heatmap
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chapters ranked by recurring NEET question density: 🔥🔥🔥 Extreme Yield &nbsp;|&nbsp; 🔥🔥 High Yield
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmap.map((item) => (
              <div
                key={item.chapter}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">{item.heatFlames}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.subject === "Physics"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : item.subject === "Chemistry"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {item.subject}
                  </span>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {item.chapter}
                </h3>

                <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono pt-1">
                  <span>~{item.avgQuestionsPerYear} Qs / Year</span>
                  <span className="font-bold text-rose-600">~{item.totalWeightageMarks} Marks</span>
                </div>

                <p className="text-[10px] text-slate-500 leading-snug pt-1 border-t border-slate-200/60">
                  {item.keyFocus}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. FILTER BAR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filters:</span>
            </div>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="All">All Years</option>
              <option value="2024">NEET 2024</option>
              <option value="2023">NEET 2023</option>
              <option value="2022">NEET 2022</option>
            </select>

            {/* Subject */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="text-slate-500">
            Showing <strong className="text-slate-900">{filteredQuestions.length}</strong> questions
          </div>
        </div>

        {/* 5. PYQ QUESTION CARDS WITH REAL TELEMETRY */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading PYQ Intelligence telemetry...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-sm transition p-5 space-y-4"
                >
                  {/* Card Header: Year, Subject, Chapter, Difficulty & Telemetry */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-sm">
                        NEET {q.year}
                      </span>
                      <span className="text-xs font-black text-slate-900">{q.subject}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{q.chapter}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : q.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Telemetry pill */}
                    <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Target className="w-3.5 h-3.5 text-sky-600" />
                        <span><strong>{q.telemetry.totalAttempts.toLocaleString()}</strong> Attempts</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1 text-emerald-700">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span><strong>{q.telemetry.accuracyPercentage}%</strong> Accuracy</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div className="flex items-center gap-1 text-amber-700">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span><strong>{q.telemetry.avgTimeSeconds}s</strong> Avg Time</span>
                      </div>
                    </div>
                  </div>

                  {/* Question Statement */}
                  <div className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <KaTeXRenderer content={q.questionText} />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt) => {
                      const isCorrect = opt.key === q.correctOption;
                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                            isExpanded && isCorrect
                              ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isExpanded && isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1">
                            <KaTeXRenderer content={opt.text} />
                          </div>
                          {isExpanded && isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Toggle Explanation */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isExpanded ? "Hide Solution" : "Reveal Answer & NCERT Solution"}</span>
                    </button>

                    <Link
                      href="/practice"
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <span>Practice in CBT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {isExpanded && q.explanation && (
                    <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-slate-800 space-y-1 text-xs">
                      <span className="font-bold text-[11px] text-sky-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-sky-700" /> NCERT Detailed Solution
                      </span>
                      <div className="text-slate-700 leading-relaxed">
                        <KaTeXRenderer content={q.explanation} />
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}
