"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  PlayCircle,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  LogOut,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  User,
  ChevronRight,
  RotateCcw,
  Flame,
  Sliders,
  Users
} from "lucide-react";
import { UserSession } from "@/lib/auth/session";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active session profile
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to load user session", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">

      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 lg:px-12 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-sky-500 rounded-xl flex items-center justify-center font-black text-white text-xl shadow">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">NEETora</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Student Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Authentic Computer Based Examination Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mistakes"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-white px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Mistake Book</span>
          </Link>

          <Link
            href="/analytics"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/40 hover:bg-emerald-900/60 transition"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Attempt DNA</span>
          </Link>

          <Link
            href="/pyq"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-white px-3 py-1.5 rounded-lg border border-amber-900/60 bg-amber-950/40 hover:bg-amber-900/60 transition"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>PYQ Heatmap</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-white">{user?.fullName || "NEET Aspirant"}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono">Target: {user?.targetScore || 680}+</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#06382c] to-[#0b5443] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>All-India NEET UG 2027 Diagnostic Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.fullName || "Candidate"}!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Select your mode below. Launch authentic full-length CBT simulation under official NTA exam conditions or practice high-yield questions with instant NCERT explanations.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link
                href="/analytics?tab=simulator"
                className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Score Simulator: Live Diagnostic</span>
              </Link>
              <Link
                href="/analytics?tab=benchmarking"
                className="inline-flex items-center gap-1.5 bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/40 text-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                <Users className="w-3.5 h-3.5 text-sky-300" />
                <span>National Benchmarking: Live Standing</span>
              </Link>
            </div>
          </div>
        </div>

        {/* DAILY NEET & ADAPTIVE PRACTICE MODULES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Adaptive Practice & Daily Routine
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
              <span>Active Daily Drill</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. DAILY NEET: TODAY'S NEETORA 30 */}
            <div className="bg-gradient-to-br from-[#06382c] to-[#0c4a3b] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-700/60 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Daily Smart Drill
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> ~30 Mins
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Today's NEETora 30
                  </h4>
                  <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                    10 Physics • 10 Chemistry • 10 Biology calibrated specifically for your exam readiness profile.
                  </p>
                </div>

                {/* Composition Breakdown: 40% Weak Topics, 30% Mistakes, 20% PYQ, 10% Revision */}
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Personalized Composition:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="p-1.5 bg-black/20 rounded-lg flex items-center justify-between">
                      <span className="text-emerald-200">Weak Topics (40%)</span>
                      <strong className="font-mono text-white">12 Qs</strong>
                    </div>
                    <div className="p-1.5 bg-black/20 rounded-lg flex items-center justify-between">
                      <span className="text-rose-200">Mistakes (30%)</span>
                      <strong className="font-mono text-white">9 Qs</strong>
                    </div>
                    <div className="p-1.5 bg-black/20 rounded-lg flex items-center justify-between">
                      <span className="text-amber-200">PYQ Exact (20%)</span>
                      <strong className="font-mono text-white">6 Qs</strong>
                    </div>
                    <div className="p-1.5 bg-black/20 rounded-lg flex items-center justify-between">
                      <span className="text-sky-200">Revision (10%)</span>
                      <strong className="font-mono text-white">3 Qs</strong>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/practice?mode=daily_neet"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap"
              >
                <PlayCircle className="w-4 h-4 shrink-0" />
                <span>Start Today's NEETora 30</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* 2. ADAPTIVE RECOVERY SET */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 hover:border-amber-400 shadow-md flex flex-col justify-between space-y-5 transition hover:shadow-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Adaptive Weakness Cure
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-500" /> 30 Questions
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    Your 30-Question Recovery Set
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Custom diagnostic set drawn directly from verified question bank matching your weakest syllabus zones.
                  </p>
                </div>

                {/* Quota breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">⚡ Physics High-Yield Pool</span>
                    <span className="font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono">12 Questions</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">🧬 Biology High-Yield Pool</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">10 Questions</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">🧪 Chemistry High-Yield Pool</span>
                    <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">8 Questions</span>
                  </div>
                </div>
              </div>

              <Link
                href="/practice?mode=adaptive"
                className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap"
              >
                <Zap className="w-4 h-4 shrink-0" />
                <span>Launch 30-Question Recovery Set</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

          </div>
        </div>

        {/* 2 Primary Modes: Exam Mode & Practice Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. EXAM MODE CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 hover:border-amber-400 shadow-md flex flex-col justify-between space-y-6 transition hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Full Simulation
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> 180 Minutes
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  All-India NEET Full Syllabus Mock Exam (180 Questions)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Strict exam hall simulation with server-authoritative timer, 180 questions across Physics, Chemistry, Botany, and Zoology, +4 / -1 marking scheme, and auto-submission.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                  <span className="font-black text-slate-800 text-sm">180 Questions</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Marking</span>
                  <span className="font-black text-emerald-600 text-sm">+4 / -1 Standard</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Security Safeguards Active:
                </span>
                <p className="leading-snug text-amber-800">
                  Timer is server-backed. Navigating back or running out of time automatically submits your exam session.
                </p>
              </div>
            </div>

            <Link
              href="/exam"
              className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap"
            >
              <PlayCircle className="w-4 h-4 shrink-0" />
              <span>Enter Exam Hall (CBT Mode)</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>

          {/* 2. PRACTICE MODE CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 hover:border-emerald-400 shadow-md flex flex-col justify-between space-y-6 transition hover:shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Active Learning
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" /> Instant Solutions
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Diagnostic Practice Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Learning-oriented test drill with immediate NCERT explanations on option selection, timer freeze, telemetry capture, and auto-resume.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Feedback</span>
                  <span className="font-black text-slate-800 text-sm">Instant NCERT</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Analytics</span>
                  <span className="font-black text-emerald-600 text-sm">Attempted / Skipped</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Deep Learning Telemetry:
                </span>
                <p className="leading-snug text-emerald-800">
                  Tracks speed per question, skipped items, and creates structured data for your personalized mistake book.
                </p>
              </div>
            </div>

            <Link
              href="/practice"
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Launch Practice Session</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* 2 Advanced Cognitive Modules: Mistake Book & Attempt DNA */}
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Error Remediation & Cognitive Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Eliminate negative marks and optimize exam pacing through personalized telemetry and adaptive prescriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* 1. MISTAKE BOOK CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-200 hover:border-rose-300 shadow-md flex flex-col justify-between transition hover:shadow-xl h-full">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                    Auto-Catalogued Errors
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Re-Test Drill
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-600 shrink-0" />
                    Mistake Book
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Every incorrect answer is automatically captured with diagnostic reasons (Silly mistake, Misread question, Calculation mistake, Forgot fact). Filter by Subject and generate targeted re-tests.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-3">
                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Diagnostic Tags</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5 whitespace-nowrap">7 Categories</span>
                  </div>
                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Target Goal</span>
                    <span className="font-black text-rose-600 text-xs sm:text-sm mt-0.5 whitespace-nowrap">0 Negative Marks</span>
                  </div>
                </div>
              </div>

              <Link
                href="/mistakes"
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap mt-5"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Open Mistake Book</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* 2. ATTEMPT DNA & WEAKNESS MAP CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-300 hover:border-emerald-400 shadow-md flex flex-col justify-between transition hover:shadow-xl h-full">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Cognitive Telemetry
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Attempt DNA
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600 shrink-0" />
                    Attempt DNA & Weakness Map
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Multivariate analysis measuring Knowledge, Accuracy, Time Management, and Consistency. Uncovers your Biggest Score Leaks, Chapter Heatmap, and prescribes Your Next Best Action.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-3">
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Cognitive DNA</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5 whitespace-nowrap">4 Core Pillars</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Prescription</span>
                    <span className="font-black text-emerald-700 text-xs sm:text-sm mt-0.5 whitespace-nowrap">Next Best Action</span>
                  </div>
                </div>
              </div>

              <Link
                href="/analytics"
                className="w-full py-3.5 px-4 bg-[#06382c] hover:bg-[#084a3b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap mt-5"
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>View Attempt DNA</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

            {/* 3. PYQ INTELLIGENCE & HEATMAP CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 hover:border-amber-400 shadow-md flex flex-col justify-between transition hover:shadow-xl h-full">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    High-Yield Trends
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500 shrink-0" /> PYQ Heatmap
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
                    PYQ Intelligence & Heatmap
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    NTA authentic past year questions with community attempts, live accuracy rates, and solution speed benchmarks. Discover high-density chapters ranking: Genetics, Physiology, Modern Physics.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-auto pt-3">
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Top-Yield</span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm mt-0.5 whitespace-nowrap flex items-center gap-1">
                      <span>Genetics</span>
                      <span className="text-xs tracking-tighter">🔥🔥🔥</span>
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Live Telemetry</span>
                    <span className="font-black text-amber-700 text-xs sm:text-sm mt-0.5 whitespace-nowrap">Speed & Accuracy</span>
                  </div>
                </div>
              </div>

              <Link
                href="/pyq"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap mt-5"
              >
                <Flame className="w-4 h-4 shrink-0 text-slate-950" />
                <span>Explore PYQ Heatmap</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
