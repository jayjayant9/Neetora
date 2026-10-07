"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Dna,
  Zap,
  Clock,
  Target,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  PlayCircle,
  TrendingUp,
  Brain,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Flame,
  Award,
  Sliders,
  Users,
  Check
} from "lucide-react";
import { AttemptDnaReport } from "@/lib/data/attempt-dna";
import { generateScoreSimulatorData, ScoreSimulatorData } from "@/lib/data/score-simulator";
import { generateBenchmarkReport, BenchmarkReport } from "@/lib/data/performance-benchmarking";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"dna" | "simulator" | "benchmarking">(
    initialTab === "simulator" ? "simulator" : initialTab === "benchmarking" ? "benchmarking" : "dna"
  );

  const [dnaReport, setDnaReport] = useState<AttemptDnaReport | null>(null);
  const [simulatorData, setSimulatorData] = useState<ScoreSimulatorData | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Score simulator interactive toggles
  const [enabledLevers, setEnabledLevers] = useState<{ [key: string]: boolean }>({
    "lever-silly": true,
    "lever-weak": true,
    "lever-time": true
  });

  const [activeSubjectTab, setActiveSubjectTab] = useState<"Physics" | "Chemistry" | "Biology">("Physics");

  useEffect(() => {
    async function loadData() {
      try {
        const [dnaRes, simRes, benchRes] = await Promise.all([
          fetch("/api/analytics/dna").then((r) => r.ok ? r.json() : null),
          fetch("/api/analytics/simulator").then((r) => r.ok ? r.json() : null),
          fetch("/api/analytics/benchmarking").then((r) => r.ok ? r.json() : null)
        ]);

        if (dnaRes?.dna) setDnaReport(dnaRes.dna);
        if (simRes?.simulator) setSimulatorData(simRes.simulator);
        if (benchRes?.benchmarking) setBenchmarkData(benchRes.benchmarking);
      } catch (err) {
        console.error("Failed to load analytics suite", err);
      } finally {
        // Fallbacks if fetch fails
        if (!simulatorData) setSimulatorData(generateScoreSimulatorData());
        if (!benchmarkData) setBenchmarkData(generateBenchmarkReport());
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !dnaReport || !simulatorData || !benchmarkData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Synthesizing Diagnostic Analytics Suite...</p>
        </div>
      </div>
    );
  }

  const { dnaMetrics, timeBehaviour, weaknessMap, biggestScoreLeaks, nextBestActions } = dnaReport;
  const currentSubjectWeakness = weaknessMap.find((w) => w.subject === activeSubjectTab);

  // Dynamic calculation for Score Simulator based on active levers
  const dynamicPotentialGain = simulatorData.levers.reduce((acc, lever) => {
    return enabledLevers[lever.id] ? acc + lever.potentialMarks : acc;
  }, 0);

  const toggleLever = (id: string) => {
    setEnabledLevers((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
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
              <Dna className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">Diagnostic & Performance Suite</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-full">
                  Signature Engine
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 block">
                Attempt DNA • Score Simulator • Performance Benchmarking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/mistakes"
              className="inline-flex items-center gap-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 font-bold px-3 py-1.5 rounded-xl shadow transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mistake Book</span>
            </Link>
          </div>
        </div>
      </header>

      {/* VIEW TABS BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-[65px] z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("dna")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "dna"
                ? "bg-[#06382c] text-white shadow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>Attempt DNA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "simulator"
                ? "bg-[#f97316] text-white shadow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Score Simulator</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              +{simulatorData.totalPotentialGain} M
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("benchmarking")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "benchmarking"
                ? "bg-sky-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Performance Benchmarking</span>
            <span className="bg-sky-400/20 text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              National
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8">

        {/* ======================================================== */}
        {/* TAB 1: ATTEMPT DNA                                      */}
        {/* ======================================================== */}
        {activeTab === "dna" && (
          <div className="space-y-8">
            {/* HERO: ATTEMPT DNA CARD */}
            <div className="bg-gradient-to-br from-[#06382c] via-[#094738] to-[#04241c] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-emerald-700/50">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Calibrated for NEET UG Competition</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                      YOUR ATTEMPT DNA
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
                      Multivariate cognitive evaluation measuring knowledge depth, exam endurance, time discipline, and across-subject uniformity.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-950/70 border border-emerald-600/50 rounded-2xl flex items-center gap-4 text-center shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Overall Score</span>
                      <span className="text-3xl font-black text-amber-400 font-mono">
                        {dnaReport.overallScore} <span className="text-sm text-slate-400">/ 720</span>
                      </span>
                    </div>
                  </div>
                </div>

                {dnaReport.overallScore === 0 && (
                  <div className="p-4 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <span className="text-xs text-amber-200">
                        Ready for test diagnostic: Launch the 180-Question Mock Exam to compute your live Attempt DNA, weakness map, and score leak recovery roadmap.
                      </span>
                    </div>
                    <Link
                      href="/exam"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition whitespace-nowrap self-start sm:self-auto"
                    >
                      Enter Exam Hall
                    </Link>
                  </div>
                )}

                {/* 4 CORE DNA PILLARS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Pillar 1: Knowledge */}
                  <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-sky-400" /> Knowledge
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
                        {dnaMetrics.knowledge.badge}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{dnaMetrics.knowledge.score}</span>
                        <span className="text-xs text-sky-200">/ 10</span>
                      </div>
                      <span className="text-[10px] text-sky-200/70 block mt-0.5">Topper Benchmark: {dnaMetrics.knowledge.benchmark}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full"
                        style={{ width: `${(dnaMetrics.knowledge.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-100/70 leading-snug">
                      {dnaMetrics.knowledge.description}
                    </p>
                  </div>

                  {/* Pillar 2: Accuracy */}
                  <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-400" /> Accuracy
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                        {dnaMetrics.accuracy.badge}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{dnaMetrics.accuracy.score}</span>
                        <span className="text-xs text-emerald-200">/ 10</span>
                      </div>
                      <span className="text-[10px] text-emerald-200/70 block mt-0.5">Topper Benchmark: {dnaMetrics.accuracy.benchmark}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${(dnaMetrics.accuracy.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-100/70 leading-snug">
                      {dnaMetrics.accuracy.description}
                    </p>
                  </div>

                  {/* Pillar 3: Time Management */}
                  <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" /> Time Management
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        {dnaMetrics.timeManagement.badge}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{dnaMetrics.timeManagement.score}</span>
                        <span className="text-xs text-amber-200">/ 10</span>
                      </div>
                      <span className="text-[10px] text-amber-200/70 block mt-0.5">Topper Benchmark: {dnaMetrics.timeManagement.benchmark}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${(dnaMetrics.timeManagement.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-100/70 leading-snug">
                      {dnaMetrics.timeManagement.description}
                    </p>
                  </div>

                  {/* Pillar 4: Consistency */}
                  <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-purple-400" /> Consistency
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                        {dnaMetrics.consistency.badge}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{dnaMetrics.consistency.score}</span>
                        <span className="text-xs text-purple-200">/ 10</span>
                      </div>
                      <span className="text-[10px] text-purple-200/70 block mt-0.5">Topper Benchmark: {dnaMetrics.consistency.benchmark}</span>
                    </div>
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-400 h-full rounded-full"
                        style={{ width: `${(dnaMetrics.consistency.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-100/70 leading-snug">
                      {dnaMetrics.consistency.description}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* BIGGEST SCORE LEAKS & NEXT BEST ACTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Biggest Score Leaks (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      Negative Mark Hotspots
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Biggest Score Leaks
                    </h3>
                  </div>
                  <Flame className="w-5 h-5 text-rose-600" />
                </div>

                <div className="space-y-3">
                  {biggestScoreLeaks.map((leak) => (
                    <div
                      key={leak.rank}
                      className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                            {leak.rank}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900">{leak.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-rose-700 font-mono">
                          +{leak.potentialMarksRecovery} M Recovery
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug pl-8">
                        {leak.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Next Best Action (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Adaptive Prescription
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Your Next Best Action
                      </h3>
                    </div>
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Data-driven study roadmap calculated to yield the maximum score improvement in minimum time.
                  </p>

                  {/* Action Plan */}
                  <div className="space-y-3 mt-4">
                    {nextBestActions.map((action, idx) => (
                      <div
                        key={action.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-slate-900">{action.actionText}</h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span>{action.subject}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" /> ~{action.estimatedMinutes} mins
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          action.priority === "Crucial"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : action.priority === "High"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Ready to execute prescription?
                  </span>
                  <Link
                    href="/mistakes"
                    className="px-5 py-2.5 bg-[#06382c] hover:bg-[#084a3b] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>Execute In Mistake Book</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>

            {/* WEAKNESS MAP (HEATMAP STATUS: 🔴 🟡 🟢) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                    Syllabus Mastery Heatmap
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Cognitive Weakness Map
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chapter-level diagnostic status: 🔴 Critical Weakness &nbsp;|&nbsp; 🟡 Moderate Revision &nbsp;|&nbsp; 🟢 Strong Mastery
                  </p>
                </div>

                {/* Subject Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  {(["Physics", "Chemistry", "Biology"] as const).map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setActiveSubjectTab(sub)}
                      className={`px-4 py-1.5 rounded-lg transition ${
                        activeSubjectTab === sub
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter Weakness Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSubjectWeakness?.nodes.map((node) => {
                  let cardBg = "bg-slate-50/80 border-slate-200";
                  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";

                  if (node.level === "critical") {
                    cardBg = "bg-rose-50/50 border-rose-200";
                    badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                  } else if (node.level === "moderate") {
                    cardBg = "bg-amber-50/50 border-amber-200";
                    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                  } else if (node.level === "mastered") {
                    cardBg = "bg-emerald-50/50 border-emerald-200";
                    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  }

                  return (
                    <div
                      key={node.chapterName}
                      className={`p-4 rounded-2xl border transition space-y-2 ${cardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{node.symbol}</span>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {node.chapterName}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {node.accuracy}% Accuracy
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {node.recommendation}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Recorded Errors: <strong className="text-slate-800">{node.mistakesCount} questions</strong></span>
                        <span>Status: <strong className="capitalize text-slate-800">{node.level}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* TIME BEHAVIOUR DIAGNOSTICS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    Exam Hall Pacing Diagnostics
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Time Behaviour Analytics
                  </h3>
                </div>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {timeBehaviour.map((tb) => (
                  <div
                    key={tb.id}
                    className={`p-5 rounded-2xl border space-y-2 ${
                      tb.type === "warning"
                        ? "bg-rose-50/50 border-rose-200 text-rose-950"
                        : tb.type === "positive"
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                        : "bg-amber-50/50 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs">{tb.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        tb.type === "warning"
                          ? "bg-rose-100 text-rose-800 border-rose-200"
                          : tb.type === "positive"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {tb.impactMarks > 0 ? `+${tb.impactMarks} M` : `${tb.impactMarks} M`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {tb.observation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SCORE SIMULATOR                                  */}
        {/* ======================================================== */}
        {activeTab === "simulator" && (
          <div className="space-y-8">
            
            {/* HERO SIMULATOR BANNER */}
            <div className="bg-gradient-to-br from-[#0c2f25] via-[#104b3c] to-[#08221b] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Diagnostic Simulation Engine</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                      Where Can You Gain Marks?
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                      Synthesized across your completed mock attempts. Analyzes marks leaked from negative penalty, unattempted familiar concepts, and time pressure.
                    </p>
                  </div>

                  {/* SCORE RECOVERY CARD */}
                  <div className="p-5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">Current Score</span>
                      <span className="text-3xl font-black font-mono text-white">{simulatorData.currentScore}</span>
                      <span className="text-[10px] text-emerald-200/60 block">/ 720</span>
                    </div>

                    <div className="text-2xl font-black text-amber-400">+</div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider">Opportunity</span>
                      <span className="text-3xl font-black font-mono text-amber-400">+{dynamicPotentialGain}</span>
                      <span className="text-[10px] text-amber-200/70 block">Recoverable Marks</span>
                    </div>

                    <div className="text-2xl font-black text-emerald-400">=</div>

                    <div className="text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">Simulated Score</span>
                      <span className="text-3xl font-black font-mono text-emerald-300">
                        {simulatorData.currentScore + dynamicPotentialGain}
                      </span>
                      <span className="text-[10px] text-emerald-200/60 block">Projected Target</span>
                    </div>
                  </div>
                </div>

                {/* Prominent Diagnostic Disclaimer */}
                <div className="p-3.5 bg-amber-500/15 border border-amber-400/30 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Diagnostic Notice:</strong> {simulatorData.disclaimer}
                  </p>
                </div>
              </div>
            </div>

            {/* SUBJECT OPPORTUNITY BREAKDOWN (3 COLUMNS) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Potential Improvement by Subject
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exact breakdown of marks obtainable through error recovery and targeted NCERT reinforcement.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {simulatorData.opportunities.map((opp) => (
                  <div
                    key={opp.subject}
                    className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-slate-300 shadow-sm flex flex-col justify-between space-y-5 transition"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-slate-900">{opp.subject}</span>
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                          +{opp.potentialGain} Marks
                        </span>
                      </div>

                      {/* Current vs Simulated */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Current Baseline:</span>
                          <strong className="text-slate-900 font-mono">{opp.currentScore} / {opp.maxScore}</strong>
                        </div>
                        <div className="flex items-center justify-between text-emerald-700">
                          <span className="font-bold">Simulated Potential:</span>
                          <strong className="font-mono">{opp.simulatedScore} / {opp.maxScore}</strong>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(opp.simulatedScore / opp.maxScore) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Factors list */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Key Recovery Leaks:
                        </span>
                        {opp.factors.map((f) => (
                          <div
                            key={f.id}
                            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{f.factor}</span>
                              <span className="text-emerald-700 font-mono font-bold">+{f.recoveryMarks} M</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {f.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/practice?mode=adaptive"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>Drill {opp.subject} Weak Zones</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE SIMULATION LEVERS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Interactive What-If Scenario
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Toggle Strategic Action Levers
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Activate or deactivate simulation levers to see how specific behavioral corrections impact your score trajectory.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Calculated Opportunity</span>
                  <span className="text-2xl font-black text-amber-600 font-mono">+{dynamicPotentialGain} Marks</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {simulatorData.levers.map((lever) => {
                  const isChecked = enabledLevers[lever.id] ?? true;
                  return (
                    <button
                      type="button"
                      key={lever.id}
                      onClick={() => toggleLever(lever.id)}
                      className={`p-5 rounded-2xl border text-left transition space-y-2 flex flex-col justify-between ${
                        isChecked
                          ? "bg-amber-50/70 border-amber-300 shadow-sm"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                            isChecked
                              ? "bg-amber-500 border-amber-600 text-slate-950 font-black"
                              : "border-slate-300 bg-white"
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                          <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-mono">
                            +{lever.potentialMarks} M
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1">{lever.name}</h4>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {lever.description}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isChecked ? "● Lever Active in Model" : "○ Deactivated"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PERFORMANCE BENCHMARKING                         */}
        {/* ======================================================== */}
        {activeTab === "benchmarking" && (
          <div className="space-y-8">

            {/* TOP STATISTICAL SIGNIFICANCE BANNER */}
            <div className="bg-gradient-to-br from-[#0c2e42] via-[#0e3b54] to-[#071f2d] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-700/60 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-sky-400/20 border border-sky-400/30 text-sky-200 px-3 py-1 rounded-full text-xs font-bold">
                    <Users className="w-3.5 h-3.5 text-sky-300" />
                    <span>Statistically Validated Cohort Analysis</span>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{benchmarkData.confidenceInterval}</span>
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                      Performance Benchmarking
                    </h2>
                    <p className="text-xs sm:text-sm text-sky-100/80 mt-1 max-w-xl leading-relaxed">
                      Rigorous peer calibration matching your CBT results against verified medical aspirants across India under identical examination timing constraints.
                    </p>
                  </div>

                  {/* Standing Pill */}
                  <div className="p-5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 text-center shrink-0 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-sky-300 block tracking-wider">
                      National Standing
                    </span>
                    <div className="text-3xl font-black font-mono text-amber-400">
                      {benchmarkData.compositePercentile}th <span className="text-sm font-sans text-white">Percentile</span>
                    </div>
                    <span className="text-[11px] text-sky-200/80 block">
                      Stronger than {benchmarkData.compositePercentile}% of all attempts
                    </span>
                  </div>
                </div>

                {/* Statistical Criteria Indicator */}
                <div className="p-3 bg-sky-950/80 border border-sky-500/30 rounded-2xl text-xs text-sky-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{benchmarkData.significanceNotice}</span>
                  </div>
                  <span className="hidden sm:inline-block font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px]">
                    N = {benchmarkData.sampleSizeAttempts.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBJECT BENCHMARKS (3 CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benchmarkData.subjects.map((sub) => {
                const isAhead = sub.userAccuracy >= sub.medianAccuracy;
                const diff = sub.userAccuracy - sub.medianAccuracy;

                return (
                  <div
                    key={sub.subject}
                    className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-slate-300 shadow-sm flex flex-col justify-between space-y-5 transition"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-slate-900">{sub.subject}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isAhead
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {isAhead ? `+${diff}% Above Median` : `${diff}% Below Median`}
                        </span>
                      </div>

                      {/* Accuracy Benchmarks */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Your Accuracy:</span>
                          <strong className="text-base font-black text-slate-900 font-mono">{sub.userAccuracy}%</strong>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${sub.userAccuracy}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">NEETora Median</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{sub.medianAccuracy}%</span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Topper Cohort</span>
                            <span className="font-bold text-emerald-800 font-mono text-xs">{sub.topperAccuracy}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Standout Narrative Box */}
                      <div className="p-3.5 bg-sky-50/80 border border-sky-100 rounded-2xl text-xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-sky-800 block tracking-wider">
                          Relative Standing:
                        </span>
                        <p className="font-bold text-slate-900 text-xs">
                          {sub.comparisonNarrative}
                        </p>
                      </div>

                      {/* Pacing Speed Benchmarks */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Average Speed</span>
                          <span className="font-mono font-bold text-slate-900">{sub.userAvgSeconds}s / question</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          Median: {sub.medianAvgSeconds}s
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/practice"
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>Sharpen {sub.subject} Speed</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default function AnalyticsDnaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Loading Diagnostic Analytics...</p>
          </div>
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
