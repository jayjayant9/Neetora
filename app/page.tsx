"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  PlayCircle,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Check,
  Layers,
  Target,
  Zap,
  HelpCircle,
  FileText,
  ChevronRight,
  X,
  Lock
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedExamModal, setSelectedExamModal] = useState<any | null>(null);

  // Chrome Browser Back Button Support for Modals
  const openExamModal = (exam: any) => {
    setSelectedExamModal(exam);
    if (typeof window !== "undefined") {
      window.history.pushState({ modalOpen: true }, "", window.location.href);
    }
  };

  const closeExamModal = () => {
    setSelectedExamModal(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      setSelectedExamModal(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const mockExams = [
    {
      id: "exam-mock-1",
      title: "NEET 2027 Full Syllabus Mock 01",
      questionsCount: "180 questions",
      duration: "3 hours",
      pattern: "+4 / -1 NTA Standard",
      accentColor: "border-amber-400 hover:border-amber-500",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      buttonColor: "bg-[#f97316] hover:bg-[#ea580c] text-white",
      tags: ["Physics", "Chemistry", "Botany", "Zoology"],
      description: "Full-length all-India standard test simulating the exact NEET UG paper pattern with Section A (35 mandatory) and Section B (10 out of 15 optional).",
      breakdown: [
        { topic: "Physics (Class 11 & 12)", details: "Mechanics, Electrostatics, Optics, Modern Physics" },
        { topic: "Chemistry (Physical, Org, Inorg)", details: "Chemical Bonding, Stoichiometry, Carbonyl Compounds" },
        { topic: "Biology (Botany & Zoology)", details: "Genetics, Plant Physiology, Human Reproduction, Circulation" }
      ]
    },
    {
      id: "exam-mock-2",
      title: "Biology NCERT Line-by-Line Mastery",
      questionsCount: "90 questions",
      duration: "90 minutes",
      pattern: "360 Marks Target",
      accentColor: "border-emerald-500 hover:border-emerald-600",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      buttonColor: "bg-[#10b981] hover:bg-[#059669] text-white",
      tags: ["Botany", "Zoology", "NCERT Extracts", "High Yield"],
      description: "Laser-focused biology revision strictly compiled from NCERT lines, assertions, diagrams, and historical NEET question bank.",
      breakdown: [
        { topic: "Genetics & Evolution", details: "Principles of Inheritance, Molecular Basis, DNA Replication" },
        { topic: "Human Physiology", details: "Neural Control, Chemical Coordination, Digestion, Breathing" },
        { topic: "Plant Physiology & Ecology", details: "Photosynthesis, Respiration, Biodiversity & Conservation" }
      ]
    },
    {
      id: "exam-mock-3",
      title: "Physics & Chemistry High-Yield PYQ Sprint",
      questionsCount: "90 questions",
      duration: "90 minutes",
      pattern: "2018 - 2024 PYQs",
      accentColor: "border-sky-500 hover:border-sky-600",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
      buttonColor: "bg-[#0284c7] hover:bg-[#0369a1] text-white",
      tags: ["Physics", "Chemistry", "Formula Based", "Past Papers"],
      description: "High-probability repeat concepts from past 7 years of NEET with comprehensive step-by-step KaTeX mathematical derivations.",
      breakdown: [
        { topic: "Electrodynamics & Magnetism", details: "Coulomb's Law, Biot-Savart Law, Electromagnetic Induction" },
        { topic: "Organic Reaction Mechanisms", details: "Aldol, Cannizzaro, Grignard Reagents, Biomolecules" },
        { topic: "Physical Chemistry Equations", details: "Chemical Kinetics, Thermodynamics, Solutions & Colligative" }
      ]
    },
  ];

  const filteredExams = activeTab === "all"
    ? mockExams
    : mockExams.filter(e => e.tags.some(t => t.toLowerCase().includes(activeTab)));

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-800 flex flex-col font-sans">

      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER (Dark Emerald Medical Tone from Image 2)           */}
      {/* ========================================================================= */}
      <header className="bg-[#052b22] text-white px-6 lg:px-12 py-3.5 flex items-center justify-between border-b border-[#0a3d31] sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg ring-2 ring-emerald-400/30">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">NEETora</span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                CBT Engine
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Inspired by TehStudy & Learn@House) */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
          <a href="#test-knowledge" className="hover:text-emerald-400 transition">Exam List</a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition">How It Works</a>
          <a href="#why-choose-us" className="hover:text-emerald-400 transition">Why Choose Us</a>
        </nav>

        {/* Right CTA Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="text-xs text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-emerald-900/50 transition font-semibold"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-lg font-bold shadow-md transition transform hover:scale-[1.02] flex items-center gap-1.5"
          >
            <span>Register Free</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Curved Dark Emerald Canvas + Medical Hero from Image 2)   */}
      {/* ========================================================================= */}
      <section className="relative bg-[#06382c] text-white overflow-hidden pb-20 pt-10 lg:pt-16 lg:pb-28">

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">

            {/* 5-Star Social Proof Pill */}
            <div className="inline-flex items-center gap-2.5 bg-[#094738]/90 border border-emerald-600/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200 shadow-inner hover:scale-105 transition-transform duration-300">
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
              <span className="font-bold text-white">5.0 Star</span>
              <span className="text-slate-300 border-l border-emerald-700 pl-2">45,000+ NEET Aspirants</span>
            </div>

            {/* Bold Headline (from Learn@House) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Because NEET Prep <br />
              <span className="text-emerald-400 drop-shadow-sm">Is Serious Enough.</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              No distractions, no gimmicks. Master actual NTA Computer-Based Testing with realistic countdown timers, section-wise marking (+4, -1), automatic mistake tracker, and high-yield question papers.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/login?redirect=/dashboard"
                className="btn-shimmer px-6 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-1 hover:shadow-orange-500/25"
              >
                <PlayCircle className="w-4 h-4 animate-pulse" />
                Student Portal Login ➔
              </Link>

              <Link
                href="/register"
                className="px-5 py-3.5 bg-[#0b4334] hover:bg-[#0e5140] text-emerald-200 border border-emerald-600/40 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Register Free for NEET 2027
              </Link>
            </div>

            {/* Floating Metric Stats Bar (from Learn@House) */}
            <div className="pt-8 border-t border-emerald-800/60 grid grid-cols-3 gap-6 max-w-lg">
              <div className="hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-black text-white">720 / 720</div>
                <div className="text-[11px] text-emerald-200/70 font-medium">NTA Standard Marking</div>
              </div>
              <div className="border-l border-emerald-800/80 pl-6 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">15,000+</div>
                <div className="text-[11px] text-emerald-200/70 font-medium">Verified NEET Questions</div>
              </div>
              <div className="border-l border-emerald-800/80 pl-6 hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">99.4%</div>
                <div className="text-[11px] text-emerald-200/70 font-medium">CBT Simulation Precision</div>
              </div>
            </div>

          </div>

          {/* Right Hero Image Composition with Smooth Floating Chips */}
          <div className="lg:col-span-5 flex justify-center relative">

            {/* Glowing Backdrop Ring with 24s smooth spin */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/30 animate-spin-slow"></div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 blur-xl animate-pulse-subtle"></div>

              {/* Medical Student Photo Asset */}
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-emerald-500/50 shadow-2xl bg-[#03221b] group">
                <img
                  src="/images/neet-hero-student.jpg"
                  alt="NEET Medical Student Hero"
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-all duration-700 ease-out"
                />
              </div>

              {/* Floating Pill Chip 1: Timer (animate-float) */}
              <div className="absolute -top-2 -left-4 bg-[#052b22]/95 border border-emerald-500/60 text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md animate-float">
                <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">Timer Running</span>
                  <span className="font-mono font-bold text-amber-400">02:59:45 Left</span>
                </div>
              </div>

              {/* Floating Pill Chip 2: Score +4 (animate-float-slow) */}
              <div className="absolute -bottom-3 -right-2 bg-white text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-200 animate-float-slow">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">
                  +4
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold leading-none">Physics Mechanics</span>
                  <span className="text-xs font-extrabold text-slate-900">Correct Response!</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ORGANIC SCULPTED WAVE DIVIDER (Exact curved cutout aesthetic from Learn@House) */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg
            className="relative block w-full h-12 lg:h-16 text-[#fafaf9]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. "TEST YOUR KNOWLEDGE" (Exact Layout from Image 1 TehStudy)               */}
      {/* ========================================================================= */}
      <section id="test-knowledge" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 space-y-10">

        {/* Section Title & Subtitle */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Test Your Knowledge
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Practice before the actual test and diagnose your knowledge weak points with authentic NTA NEET pattern mock series.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "all", label: "All Tests" },
              { id: "physics", label: "Physics" },
              { id: "chemistry", label: "Chemistry" },
              { id: "botany", label: "Botany" },
              { id: "zoology", label: "Zoology" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${activeTab === tab.id
                  ? "bg-[#06382c] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Signature Exam Cards (Matching Image 1's 3-card layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className={`interactive-card bg-white rounded-2xl border-2 ${exam.accentColor} shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 group`}
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${exam.badgeColor} transition-transform group-hover:scale-105 duration-300`}>
                    {exam.pattern}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {exam.duration}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300">
                  {exam.title}
                </h3>

                <div className="text-xs font-semibold text-slate-500">
                  {exam.questionsCount} • {exam.duration}
                </div>

                {/* Topic Badges (Matching pills in Image 1) */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exam.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 transition-colors duration-200 group-hover:bg-slate-50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <Link
                  href="/login?redirect=/dashboard"
                  className="btn-shimmer w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 transform active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Login to Access Test Series
                </Link>

                <button
                  onClick={() => openExamModal(exam)}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors duration-200 py-1"
                >
                  View Syllabus Breakdown ▾
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Explore More Exams Link */}
        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f97316] hover:text-[#ea580c] transition group"
          >
            <span>Explore all NEET 2027/2028 Test Series</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. WORKFLOW SECTION (Mashup: TehStudy Workflow + Learn@House 3 Steps)      */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="bg-white border-y border-slate-200 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">

          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Proven 3-Step Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              NEETora Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Follow these 3 simple steps to achieve your target 680+ score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="interactive-card bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 text-center space-y-4 hover:border-emerald-300 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#06382c] text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">1. Test Practice</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take authentic CBT simulations with strict timers, NTA Section A/B optional rules, and live KaTeX mathematical formula rendering.
              </p>
            </div>

            {/* Step 2 */}
            <div className="interactive-card bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 text-center space-y-4 hover:border-amber-300 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f97316] text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-115 group-hover:-rotate-6 transition-all duration-300">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors">2. Showing Your Weak Points</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The automated <strong>Mistake Book</strong> instantly captures every question answered incorrectly or skipped, preventing negative marking on exam day.
              </p>
            </div>

            {/* Step 3 */}
            <div className="interactive-card bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 text-center space-y-4 hover:border-sky-300 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">3. Tracking Your Progress</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review granular accuracy metrics, time-per-question velocity, and subject radars to know exactly when you are ready for the medical college of your dreams.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "3 REASONS TO CHOOSE US" (Directly inspired by Image 2 Learn@House)      */}
      {/* ========================================================================= */}
      <section id="why-choose-us" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 space-y-12">

        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            3 Reasons To Choose Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered purely for NEET aspirants without fluff or gamification gimmicks.
          </p>
        </div>

        {/* 3 Outlined Rounded Cards (matching Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Reason 1 */}
          <div className="interactive-card bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#06382c] transition-all duration-300 space-y-4 shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-[#06382c] group-hover:text-emerald-300 transition-all duration-300">
              <Clock className="w-6 h-6 transition-transform group-hover:rotate-12" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#06382c] transition-colors">Authentic NTA CBT Palette</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experience the exact interface you will sit before on exam day. Standard colors: Answered, Not Answered, Marked for Review, and Evaluated states.
            </p>
            <a
              href="/prototype/cbt-simulation.html"
              className="text-xs font-bold text-[#06382c] hover:text-emerald-600 flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform"
            >
              Read More ➔
            </a>
          </div>

          {/* Reason 2 */}
          <div className="interactive-card bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#06382c] transition-all duration-300 space-y-4 shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <BookOpen className="w-6 h-6 transition-transform group-hover:rotate-12" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#06382c] transition-colors">Curated NCERT Question Bank</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              15,000+ high-yield questions strictly aligned with the latest NMC syllabus. Step-by-step KaTeX explanations and zero out-of-syllabus noise.
            </p>
            <a
              href="#test-knowledge"
              className="text-xs font-bold text-[#06382c] hover:text-emerald-600 flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform"
            >
              Explore Questions ➔
            </a>
          </div>

          {/* Reason 3 */}
          <div className="interactive-card bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-[#06382c] transition-all duration-300 space-y-4 shadow-sm group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <AlertTriangle className="w-6 h-6 transition-transform group-hover:rotate-12" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#06382c] transition-colors">Zero-Loss Mistake Book</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every negative mark is an opportunity to learn. Automated re-attempt mode ensures you never make the same conceptual error twice.
            </p>
            <a
              href="/prototype/cbt-simulation.html"
              className="text-xs font-bold text-[#06382c] hover:text-emerald-600 flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform"
            >
              Read More ➔
            </a>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION BANNER (Dark Emerald Curve)                              */}
      {/* ========================================================================= */}
      <section className="bg-[#052b22] text-white py-16 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 animate-pulse">
            NEET 2027 Mock Batch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to simulate your highest-scoring mock exam?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl mx-auto leading-relaxed">
            Test yourself now in our browser CBT simulation with real Physics, Chemistry, Botany, and Zoology questions.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="btn-shimmer inline-flex items-center gap-2 px-8 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-orange-500/25"
            >
              <PlayCircle className="w-5 h-5 animate-pulse" />
              Join NEET 2027 Mock Batch
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 lg:px-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-emerald-500 rounded-md flex items-center justify-center font-black text-slate-950 text-xs">
              N
            </div>
            <span className="font-bold text-slate-200">NEETora</span>
            <span>— Serious Medical Entrance Prep Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/register" className="hover:text-emerald-400 transition font-medium">NEET 2027/2028 Aspirants</Link>
            <Link href="/login" className="hover:text-emerald-400 transition">Student Login</Link>

          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* SYLLABUS BREAKDOWN MODAL (Inspired by Image 1 Right Side "About the Exam") */}
      {/* ========================================================================= */}
      {selectedExamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#052b22] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedExamModal.title}</h3>
                <span className="text-[11px] text-emerald-300 font-mono">
                  {selectedExamModal.questionsCount} • {selectedExamModal.duration}
                </span>
              </div>
              <button
                onClick={closeExamModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-600">
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">
                  About the Exam
                </h4>
                <p className="leading-relaxed">
                  {selectedExamModal.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Syllabus Breakdown
                </h4>
                {selectedExamModal.breakdown.map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">{item.topic}</span>
                    <span className="text-[11px] text-slate-500">{item.details}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={closeExamModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  href="/login?redirect=/dashboard"
                  className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold rounded-lg shadow"
                >
                  Sign In to Attempt ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
