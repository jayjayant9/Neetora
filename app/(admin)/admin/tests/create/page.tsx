"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  Settings, 
  CheckSquare, 
  Send, 
  Clock, 
  HelpCircle, 
  Filter, 
  Trash2, 
  Plus, 
  FileText, 
  Shuffle, 
  ToggleLeft, 
  ToggleRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { NEET_ACADEMIC_TAXONOMY } from "@/lib/data/academic-taxonomy";
import { INITIAL_QUESTIONS, StoredQuestion } from "@/lib/data/sample-questions";
import { TestType, TestStatus, TestConfiguration } from "@/lib/data/sample-tests";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";

export default function CreateTestPage() {
  const router = useRouter();

  // Wizard Step (1: Basic Info, 2: Questions, 3: Config, 4: Publish)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successTestId, setSuccessTestId] = useState<string | null>(null);

  // Browser History & Chrome Back Button Support:
  // Navigating between steps pushes history state so Chrome Back moves between wizard steps instead of exiting
  const goToStep = useCallback((step: number, push = true) => {
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("step", step.toString());
      if (push) {
        window.history.pushState({ step }, "", url.toString());
      } else {
        window.history.replaceState({ step }, "", url.toString());
      }
    }
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const stepParam = parseInt(params.get("step") || "1", 10);
    const initialStep = stepParam >= 1 && stepParam <= 4 ? stepParam : 1;
    setCurrentStep(initialStep);
    window.history.replaceState({ step: initialStep }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.step === "number") {
        setCurrentStep(e.state.step);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const st = parseInt(urlParams.get("step") || "1", 10);
        setCurrentStep(st >= 1 && st <= 4 ? st : 1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Step 1: Basic Information
  const [testName, setTestName] = useState("NEET 2027 Electrostatics & Capacitance Mastery Drill");
  const [description, setDescription] = useState(
    "Curated practice drill covering Coulomb's Law, Electric Dipoles, and Dielectric Capacitors strictly calibrated for NEET 2027 aspirants."
  );
  const [testType, setTestType] = useState<TestType>("Practice");

  // Step 2: Question Selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([
    "q-phy-001",
    "q-phy-002"
  ]);

  // Step 3: Test Configuration
  const [config, setConfig] = useState<TestConfiguration>({
    durationMinutes: 45,
    totalQuestions: 25,
    marksPerQuestion: 4,
    negativeMarks: -1,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowReview: true,
    allowBackNavigation: true,
  });

  // Step 4: Publish Lifecycle
  const [status, setStatus] = useState<TestStatus>("Draft");

  // Academic Cascading Filters
  const currentSubject = useMemo(
    () => NEET_ACADEMIC_TAXONOMY.find((s) => s.id === selectedSubjectId),
    [selectedSubjectId]
  );
  const currentChapters = useMemo(() => currentSubject?.chapters || [], [currentSubject]);
  const currentChapter = useMemo(
    () => currentChapters.find((c) => c.id === selectedChapterId),
    [currentChapters, selectedChapterId]
  );
  const currentTopics = useMemo(() => currentChapter?.topics || [], [currentChapter]);

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return INITIAL_QUESTIONS.filter((q) => {
      if (selectedSubjectId !== "all" && q.subjectId !== selectedSubjectId) return false;
      if (selectedChapterId !== "all" && q.chapterId !== selectedChapterId) return false;
      if (selectedTopicId !== "all" && q.topicId !== selectedTopicId) return false;
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;
      if (selectedYear !== "all" && q.sourceYear?.toString() !== selectedYear) return false;
      if (selectedSource !== "all" && !q.source.toLowerCase().includes(selectedSource.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesChapter = q.chapterName.toLowerCase().includes(query);
        const matchesSubject = q.subjectName.toLowerCase().includes(query);
        if (!matchesText && !matchesChapter && !matchesSubject) return false;
      }
      return true;
    });
  }, [
    selectedSubjectId,
    selectedChapterId,
    selectedTopicId,
    selectedDifficulty,
    selectedYear,
    selectedSource,
    searchQuery,
  ]);

  // Toggle single question
  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  // Bulk select all filtered
  const selectAllFiltered = () => {
    const idsToAdd = filteredQuestions.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedQuestionIds([]);
  };

  // Compute Subject Distribution
  const subjectDistribution = useMemo(() => {
    let phy = 0;
    let chem = 0;
    let bio = 0;
    selectedQuestionIds.forEach((id) => {
      const q = INITIAL_QUESTIONS.find((item) => item.id === id);
      if (q?.subjectId === "sub-phy") phy++;
      else if (q?.subjectId === "sub-chem") chem++;
      else if (q?.subjectId === "sub-bot" || q?.subjectId === "sub-zoo") bio++;
    });
    return { physics: phy, chemistry: chem, biology: bio };
  }, [selectedQuestionIds]);

  // Handle Save / Publish API
  const handleSaveTest = async (targetStatus?: TestStatus) => {
    setLoading(true);
    setErrorMsg("");
    const finalStatus = targetStatus || status;

    try {
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: testName,
          description,
          type: testType,
          questionIds: selectedQuestionIds,
          config: {
            ...config,
            totalQuestions: selectedQuestionIds.length > 0 ? selectedQuestionIds.length : config.totalQuestions,
          },
          status: finalStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create test.");
        setLoading(false);
        return;
      }

      setSuccessTestId(data.test.id);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg("Connection error while saving test.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tests"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Tests</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">Create Test</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Layers className="w-6 h-6 text-sky-600" />
            <span>Test Builder & Simulator Publisher</span>
          </h1>
          <p className="text-xs text-slate-500">
            Design multi-subject NEET CBT papers, configure scoring and timing, and publish live to the student portal.
          </p>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Questions" },
            { num: 3, label: "Configuration" },
            { num: 4, label: "Publish" },
          ].map((step) => (
            <button
              key={step.num}
              onClick={() => goToStep(step.num)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                currentStep === step.num
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                currentStep === step.num ? "bg-white text-sky-700" : "bg-slate-200 text-slate-700"
              }`}>
                {step.num}
              </span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Modal / Banner */}
      {successTestId && (
        <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-sm text-emerald-900 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-black text-base">Test Successfully Created & Saved!</h3>
              <p className="text-xs text-emerald-700">
                Identifier: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{successTestId}</code> • Status: <strong>{status}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/prototype/cbt-simulation.html"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Live CBT Simulation</span>
            </Link>
            <Link
              href="/admin/tests"
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Return to Tests Repository
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: BASIC INFORMATION                                                */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Step 1
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Basic Test Information</h2>
            <p className="text-xs text-slate-500">
              Specify the title, academic scope, and test classification.
            </p>
          </div>

          <div className="space-y-5">
            {/* Test Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Test Name *
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. NEET 2027 Full Syllabus Mock Test 01"
                className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Student Instructions
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain the syllabus covered, test pattern, and target batch..."
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              />
            </div>

            {/* Test Type Selection Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Test Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    type: "Practice" as TestType,
                    title: "Practice Test",
                    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30",
                    desc: "Chapter-wise drills with immediate answer review and hints.",
                  },
                  {
                    type: "Exam" as TestType,
                    title: "Official Exam Simulation",
                    badge: "bg-amber-50 text-amber-800 border-amber-200",
                    borderActive: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30",
                    desc: "Authentic full-length CBT (+4/-1, Section A/B, 180 min timer).",
                  },
                  {
                    type: "PYQ" as TestType,
                    title: "PYQ Previous Year",
                    badge: "bg-sky-50 text-sky-800 border-sky-200",
                    borderActive: "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/30",
                    desc: "Past official NTA NEET questions (2018 - 2024).",
                  },
                  {
                    type: "Custom" as TestType,
                    title: "Custom Test",
                    badge: "bg-purple-50 text-purple-800 border-purple-200",
                    borderActive: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30",
                    desc: "Configurable mix of chapters, custom weights, and test lengths.",
                  },
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setTestType(item.type)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      testType === item.type
                        ? item.borderActive
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badge}`}>
                        {item.type}
                      </span>
                      {testType === item.type && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => goToStep(2)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>Next: Select Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: QUESTION SELECTION                                               */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  Step 2
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">Filter & Choose Questions</h2>
                <p className="text-xs text-slate-500">
                  Pick questions from the verified NEET question bank by subject, chapter, difficulty, year, and source.
                </p>
              </div>

              {/* Selection Summary Badge */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Selected Count</span>
                  <span className="text-lg font-black text-sky-700">
                    {selectedQuestionIds.length}
                  </span>
                  <span className="text-slate-400 text-[11px]"> questions ({selectedQuestionIds.length * config.marksPerQuestion} Marks)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllFiltered}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                  >
                    Select All Filtered
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
              
              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedChapterId("all");
                    setSelectedTopicId("all");
                  }}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Subjects</option>
                  {NEET_ACADEMIC_TAXONOMY.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    setSelectedTopicId("all");
                  }}
                  disabled={selectedSubjectId === "all"}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                >
                  <option value="all">All Chapters</option>
                  {currentChapters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Topic</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={selectedChapterId === "all"}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                >
                  <option value="all">All Topics</option>
                  {currentTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="all">All Sources</option>
                  <option value="PYQ">NEET PYQ</option>
                  <option value="NCERT">NCERT Exemplar</option>
                  <option value="Internal">Internal NEETora</option>
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="pt-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by formula, keyword, or concept (e.g. 'dipole', 'capacitance', 'Mendel')..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Questions Grid with KaTeX previews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing {filteredQuestions.length} matched questions</span>
              <span>
                Distribution: Physics ({subjectDistribution.physics}) • Chemistry ({subjectDistribution.chemistry}) • Biology ({subjectDistribution.biology})
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`p-5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/40 border-sky-400 shadow-sm ring-1 ring-sky-300"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Checkbox and Metadata */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestion(q.id)}
                          className="w-4 h-4 mt-1 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {q.subjectName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {q.chapterName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.difficulty === "easy"
                                ? "bg-emerald-100 text-emerald-800"
                                : q.difficulty === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {q.source} {q.sourceYear && `(${q.sourceYear})`}
                            </span>
                          </div>

                          {/* Question Text with KaTeX */}
                          <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                            <KaTeXRenderer content={q.questionText} />
                          </div>

                          {/* Options Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                                  opt.key === q.correctOption
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <span className="font-bold text-[11px] w-4">{opt.key}.</span>
                                <div>
                                  <KaTeXRenderer content={opt.text} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Select/Deselect button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleQuestion(q.id);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0 transition ${
                          isSelected
                            ? "bg-sky-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "+ Add"}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              onClick={() => goToStep(1)}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              &larr; Back to Basic Info
            </button>
            <button
              onClick={() => goToStep(3)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>Next: Test Configuration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: TEST CONFIGURATION                                               */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Step 3
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Test Timing & Scoring Configuration</h2>
            <p className="text-xs text-slate-500">
              Set standard NTA marks (+4/-1), exam duration, question randomization, and navigation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Timing & Marks */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Duration & Scoring Rules
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Test Duration (Minutes) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.durationMinutes}
                    onChange={(e) => setConfig({ ...config, durationMinutes: Number(e.target.value) })}
                    min={5}
                    max={360}
                    className="w-full text-xs p-3 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Standard NEET Full Mock = 180 min (3 hours) • Rapid chapter drill = 45 min
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Questions
                </label>
                <input
                  type="number"
                  value={selectedQuestionIds.length > 0 ? selectedQuestionIds.length : config.totalQuestions}
                  onChange={(e) => setConfig({ ...config, totalQuestions: Number(e.target.value) })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
                />
                <span className="text-[11px] text-sky-600 mt-1 block">
                  {selectedQuestionIds.length} questions currently selected in Step 2
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marks per Correct *
                  </label>
                  <input
                    type="number"
                    value={config.marksPerQuestion}
                    onChange={(e) => setConfig({ ...config, marksPerQuestion: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
                  />
                  <span className="text-[10px] text-emerald-600 mt-1 block">+4 (NTA Standard)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Negative Marks *
                  </label>
                  <input
                    type="number"
                    value={config.negativeMarks}
                    onChange={(e) => setConfig({ ...config, negativeMarks: Number(e.target.value) })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white"
                  />
                  <span className="text-[10px] text-rose-600 mt-1 block">-1 (NTA Standard)</span>
                </div>
              </div>
            </div>

            {/* Right: Anti-Cheat & Navigation Controls */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Randomization & CBT Navigation
              </h3>

              {/* Shuffle Questions */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Shuffle Questions</span>
                  <span className="text-[11px] text-slate-500">Deliver unique question order to each student</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, shuffleQuestions: !config.shuffleQuestions })}
                  className="text-sky-600 hover:text-sky-700"
                >
                  {config.shuffleQuestions ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Shuffle Options */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Shuffle Options</span>
                  <span className="text-[11px] text-slate-500">Permute A, B, C, D choices to prevent copying</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, shuffleOptions: !config.shuffleOptions })}
                  className="text-sky-600 hover:text-sky-700"
                >
                  {config.shuffleOptions ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Allow Review */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Allow Mark for Review</span>
                  <span className="text-[11px] text-slate-500">Student can flag questions and review via palette</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, allowReview: !config.allowReview })}
                  className="text-sky-600 hover:text-sky-700"
                >
                  {config.allowReview ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Allow Back Navigation */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Allow Back Navigation</span>
                  <span className="text-[11px] text-slate-500">Free section jumping vs strict linear sequence</span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, allowBackNavigation: !config.allowBackNavigation })}
                  className="text-sky-600 hover:text-sky-700"
                >
                  {config.allowBackNavigation ? (
                    <ToggleRight className="w-8 h-8 text-sky-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => goToStep(2)}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              &larr; Back to Questions
            </button>
            <button
              onClick={() => goToStep(4)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>Next: Review & Publish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: PUBLISH & LIFECYCLE DECK                                         */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Step 4
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">Publish Flow & Lifecycle Audit</h2>
            <p className="text-xs text-slate-500">
              Audit the test structure and choose the target status: Draft &rarr; Review &rarr; Published &rarr; Live.
            </p>
          </div>

          {/* Lifecycle Flow Pipeline Stepper */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Publishing Pipeline Flow</span>
              <span className="text-[11px] font-mono text-emerald-400">Current Target: {status}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { s: "Draft" as TestStatus, desc: "Editable Draft" },
                { s: "Review" as TestStatus, desc: "Quality Audit" },
                { s: "Published" as TestStatus, desc: "Scheduled Ready" },
                { s: "Live" as TestStatus, desc: "Active on CBT" },
              ].map((step) => (
                <button
                  key={step.s}
                  onClick={() => setStatus(step.s)}
                  className={`p-3 rounded-xl border transition ${
                    status === step.s
                      ? "bg-sky-600 border-sky-400 text-white font-black shadow-lg"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-xs">{step.s}</div>
                  <div className="text-[10px] opacity-75">{step.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Test Audit Summary */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Final Pre-Flight Audit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Test Type</span>
                <span className="font-black text-slate-900 text-sm">{testType}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Questions</span>
                <span className="font-black text-slate-900 text-sm">{selectedQuestionIds.length}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Marks</span>
                <span className="font-black text-emerald-700 text-sm">
                  {selectedQuestionIds.length * config.marksPerQuestion} Marks
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Duration</span>
                <span className="font-black text-slate-900 text-sm">{config.durationMinutes} Minutes</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Subject Balance:</span>
                <span className="font-semibold text-slate-800">
                  Physics: {subjectDistribution.physics} • Chemistry: {subjectDistribution.chemistry} • Biology: {subjectDistribution.biology}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shuffling & Anti-Cheat:</span>
                <span className="font-semibold text-slate-800">
                  Questions ({config.shuffleQuestions ? "Yes" : "No"}) • Options ({config.shuffleOptions ? "Yes" : "No"})
                </span>
              </div>
              <div className="flex justify-between">
                <span>CBT Navigation:</span>
                <span className="font-semibold text-slate-800">
                  Review Allowed ({config.allowReview ? "Yes" : "No"}) • Back Nav ({config.allowBackNavigation ? "Yes" : "No"})
                </span>
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => goToStep(3)}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              &larr; Back to Configuration
            </button>

            <div className="flex items-center gap-3">
              <button
                disabled={loading}
                onClick={() => handleSaveTest("Draft")}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Save as Draft
              </button>

              <button
                disabled={loading}
                onClick={() => handleSaveTest("Live")}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 transform active:scale-95"
              >
                {loading ? (
                  <span>Saving & Publishing...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Publish & Set Live on CBT</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
