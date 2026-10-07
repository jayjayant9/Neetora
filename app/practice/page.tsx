"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  Target, 
  Check, 
  X,
  BookOpen,
  Award,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  User,
  HelpCircle,
  AlertTriangle,
  Send,
  RefreshCw,
  MinusCircle,
  Flame,
  Zap
} from "lucide-react";
import { INITIAL_QUESTIONS, StoredQuestion } from "@/lib/data/sample-questions";
import { QuestionAttempt } from "@/lib/data/practice-sessions";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";
import { generateDailyNeetSet, generateAdaptiveRecoverySet } from "@/lib/data/adaptive-practice";
import { getMistakeBook } from "@/lib/data/mistake-book";

const LOCAL_STORAGE_KEY = "neetora_practice_active_session";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [questions] = useState<StoredQuestion[]>(() => {
    if (mode === "daily_neet") {
      return generateDailyNeetSet().questions;
    }
    if (mode === "adaptive") {
      return generateAdaptiveRecoverySet().questions;
    }
    if (mode === "mistakes") {
      const mb = getMistakeBook();
      if (mb.length > 0) {
        return mb.map((m) => ({
          id: m.id,
          questionText: m.questionText,
          subjectId: m.subject === "Physics" ? "sub-phy" : m.subject === "Chemistry" ? "sub-chem" : "sub-bot",
          subjectName: m.subject,
          chapterId: "ch-rev",
          chapterName: m.chapterName,
          classLevel: 12,
          difficulty: "medium",
          explanation: m.explanation,
          correctOption: m.correctOption,
          source: "Mistake Book Re-Test",
          status: "approved",
          options: m.options,
          createdAt: m.timestamp,
        }));
      }
    }
    return INITIAL_QUESTIONS;
  });

  const totalQuestions = questions.length;

  // Active question index (0-based)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-question state
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});

  // Timers
  const [questionTimer, setQuestionTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stored telemetry attempts for analytics
  const [attempts, setAttempts] = useState<Record<number, QuestionAttempt>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [resumedToast, setResumedToast] = useState<string | null>(null);
  const [scorecardFilter, setScorecardFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];

  // Active subject filter / tab
  const currentSubjectName = currentQuestion.subjectName;

  // 1. AUTO-RESUME STATE FROM LOCAL STORAGE ON MOUNT
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.attempts && Object.keys(parsed.attempts).length > 0) {
          setAttempts(parsed.attempts || {});
          setMarkedForReview(parsed.markedForReview || {});
          setTotalTimer(parsed.totalTimer || 0);

          const restoredIndex = typeof parsed.currentIndex === "number" && parsed.currentIndex < totalQuestions 
            ? parsed.currentIndex 
            : 0;

          setCurrentIndex(restoredIndex);

          // Restore attempt state for current question
          const currAttempt = parsed.attempts[restoredIndex];
          if (currAttempt) {
            setSelectedOption(currAttempt.selectedAnswer);
            setIsSubmitted(true);
          }

          setResumedToast(`Resumed previous practice session at Question ${restoredIndex + 1}`);
          setTimeout(() => setResumedToast(null), 5000);
        }
      }
    } catch (err) {
      console.error("Failed to load local storage session", err);
    }
  }, [totalQuestions]);

  // 2. REAL-TIME PERSISTENCE TO LOCAL STORAGE
  useEffect(() => {
    if (typeof window === "undefined" || isFinished) return;

    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          currentIndex,
          attempts,
          markedForReview,
          totalTimer,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Failed to sync session to localStorage", err);
    }
  }, [currentIndex, attempts, markedForReview, totalTimer, isFinished]);

  // 3. TIMERS (Per Question + Total Drill Stopwatch)
  useEffect(() => {
    if (isFinished) return;

    if (timerRef.current) clearInterval(timerRef.current);

    // If current question has already been answered, do NOT run questionTimer
    const existingAttempt = attempts[currentIndex];
    if (existingAttempt) {
      setQuestionTimer(existingAttempt.timeSpentSeconds);
      return;
    }

    setQuestionTimer(0);
    timerRef.current = setInterval(() => {
      setQuestionTimer((prev) => prev + 1);
      setTotalTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isFinished, attempts]);

  // 4. CHROME BROWSER BACK BUTTON SUPPORT
  const navigateToQuestion = useCallback((index: number, push = true) => {
    if (index < 0 || index >= totalQuestions) return;

    setCurrentIndex(index);
    const existing = attempts[index];
    if (existing) {
      setSelectedOption(existing.selectedAnswer);
      setIsSubmitted(true);
    } else {
      setSelectedOption(null);
      setIsSubmitted(false);
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("q", (index + 1).toString());
      if (push) {
        window.history.pushState({ qIndex: index }, "", url.toString());
      } else {
        window.history.replaceState({ qIndex: index }, "", url.toString());
      }
    }
  }, [totalQuestions, attempts]);

  // Popstate listener for Chrome browser back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.qIndex === "number") {
        const qIdx = e.state.qIndex;
        setCurrentIndex(qIdx);
        const prevAttempt = attempts[qIdx];
        if (prevAttempt) {
          setSelectedOption(prevAttempt.selectedAnswer);
          setIsSubmitted(true);
        } else {
          setSelectedOption(null);
          setIsSubmitted(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [attempts]);

  // 5. IMMEDIATE EVALUATION & TELEMETRY CAPTURE
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    if (isSubmitted) return;

    setSelectedOption(key);
    setIsSubmitted(true);

    // Immediately stop question timer when student answers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const isCorrect = key === currentQuestion.correctOption;
    const timeSpent = questionTimer;

    const attemptData: QuestionAttempt = {
      questionId: currentQuestion.id,
      selectedAnswer: key,
      correctAnswer: currentQuestion.correctOption,
      isCorrect,
      timeSpentSeconds: timeSpent,
      attemptNumber: 1,
      subjectName: currentQuestion.subjectName,
      chapterName: currentQuestion.chapterName,
      timestamp: new Date().toISOString(),
    };

    setAttempts((prev) => ({
      ...prev,
      [currentIndex]: attemptData,
    }));
  };

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  // Next / Navigation
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  // Submit Drill from Palette or Finish
  const handleSubmitDrill = async () => {
    const answeredCount = Object.keys(attempts).length;
    const confirmMessage = answeredCount < totalQuestions
      ? `You have answered ${answeredCount} of ${totalQuestions} questions. Do you want to submit your practice session now?`
      : "Are you ready to submit your practice session and review your analytics?";

    if (!confirm(confirmMessage)) return;

    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Clear local storage cache upon final submission
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    setSavingSession(true);
    try {
      const attemptsList = Object.values(attempts);
      await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: "neet-cbt-practice",
          testTitle: "NEET All-India Practice Drill (CBT Pattern)",
          attempts: attemptsList,
          totalQuestions,
        }),
      });
    } catch (err) {
      console.error("Failed to sync session telemetry", err);
    } finally {
      setSavingSession(false);
    }
  };

  // Start fresh reset
  const handleStartFresh = () => {
    if (!confirm("Are you sure you want to clear your current progress and restart?")) return;
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
    setAttempts({});
    setMarkedForReview({});
    setSelectedOption(null);
    setIsSubmitted(false);
    setTotalTimer(0);
    setQuestionTimer(0);
    setIsFinished(false);
    navigateToQuestion(0, false);
  };

  // Live Statistics
  const answeredAttempts = Object.values(attempts);
  const attemptedCount = answeredAttempts.length;
  const skippedCount = totalQuestions - attemptedCount;
  const correctCount = answeredAttempts.filter((a) => a.isCorrect).length;
  const incorrectCount = answeredAttempts.filter((a) => !a.isCorrect).length;
  const liveAccuracy = attemptedCount > 0 
    ? Math.round((correctCount / attemptedCount) * 100) 
    : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Distinct subjects in pool
  const subjectList = Array.from(new Set(questions.map((q) => q.subjectName)));

  // =========================================================================
  // VIEW: COMPLETED SUMMARY SCORECARD & ANALYTICS
  // =========================================================================
  if (isFinished) {
    const totalTimeSpent = answeredAttempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
    const avgSpeed = attemptedCount > 0 ? Math.round(totalTimeSpent / attemptedCount) : 0;
    const netScore = correctCount * 4 - incorrectCount * 1;
    const maxMarks = totalQuestions * 4;

    const filteredQuestions = questions
      .map((q, idx) => ({ q, idx, attempt: attempts[idx] }))
      .filter(({ attempt }) => {
        if (scorecardFilter === "correct") return attempt && attempt.isCorrect;
        if (scorecardFilter === "incorrect") return attempt && !attempt.isCorrect;
        if (scorecardFilter === "skipped") return !attempt;
        return true;
      });

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white text-lg">
              N
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                NEETora CBT — Practice Session Scorecard
              </h1>
              <p className="text-[11px] text-slate-400">All-India Diagnostic Performance Telemetry</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 transition"
          >
            Exit to Home
          </Link>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 border border-emerald-200">
              <Award className="w-12 h-12 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Practice Session Analysis & Telemetry
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Comprehensive performance breakdown for NEET preparation and mistake analysis.
              </p>
            </div>

            {/* 5 KPI Metric Cards: Attempted, Correct, Incorrect, Skipped, Accuracy */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 text-center">
                <span className="text-[10px] uppercase font-bold text-sky-700 block mb-1">Attempted</span>
                <span className="text-2xl sm:text-3xl font-black text-sky-900">
                  {attemptedCount} <span className="text-sm font-semibold text-sky-600">/ {totalQuestions}</span>
                </span>
                <span className="text-[10px] text-sky-600 block mt-0.5">
                  {Math.round((attemptedCount / totalQuestions) * 100)}% coverage
                </span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">{correctCount}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">+{correctCount * 4} Marks</span>
              </div>

              <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1 flex items-center justify-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" /> Incorrect
                </span>
                <span className="text-2xl sm:text-3xl font-black text-rose-700">{incorrectCount}</span>
                <span className="text-[10px] text-rose-600 block mt-0.5">-{incorrectCount * 1} Marks</span>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1 flex items-center justify-center gap-1">
                  <MinusCircle className="w-3 h-3 text-amber-600" /> Skipped
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-700">{skippedCount}</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">0 Marks penalty</span>
              </div>

              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-1 flex items-center justify-center gap-1">
                  <Target className="w-3 h-3 text-indigo-600" /> Accuracy
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">{liveAccuracy}%</span>
                <span className="text-[10px] text-indigo-600 block mt-0.5">of attempted</span>
              </div>
            </div>

            {/* Score & Time Summary Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-around gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net Score</span>
                <span className="text-xl font-black text-white">
                  {netScore} <span className="text-xs text-slate-400 font-normal">/ {maxMarks} Marks</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Speed</span>
                <span className="text-xl font-black text-sky-400">
                  {avgSpeed}s <span className="text-xs text-slate-400 font-normal">/ question</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Time Taken</span>
                <span className="text-xl font-black text-emerald-400">{formatTime(totalTimer)}</span>
              </div>
            </div>

            {/* Filterable Question Review Section */}
            <div className="text-left space-y-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Question-by-Question Analysis & Solutions
                </h3>

                {/* Filter Tabs */}
                <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setScorecardFilter("all")}
                    className={`px-3 py-1 rounded-md transition ${
                      scorecardFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All ({totalQuestions})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScorecardFilter("correct")}
                    className={`px-3 py-1 rounded-md transition ${
                      scorecardFilter === "correct" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-emerald-700"
                    }`}
                  >
                    Correct ({correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScorecardFilter("incorrect")}
                    className={`px-3 py-1 rounded-md transition ${
                      scorecardFilter === "incorrect" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-rose-700"
                    }`}
                  >
                    Incorrect ({incorrectCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScorecardFilter("skipped")}
                    className={`px-3 py-1 rounded-md transition ${
                      scorecardFilter === "skipped" ? "bg-white text-amber-700 shadow-sm" : "text-slate-600 hover:text-amber-700"
                    }`}
                  >
                    Skipped ({skippedCount})
                  </button>
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-3">
                {filteredQuestions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No questions in this filter category.
                  </div>
                ) : (
                  filteredQuestions.map(({ q, idx, attempt }) => {
                    const isExpanded = expandedCardIdx === idx;
                    const isSkipped = !attempt;
                    const isCorrect = attempt?.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-xl border transition overflow-hidden ${
                          isSkipped
                            ? "bg-slate-50/80 border-slate-200"
                            : isCorrect
                            ? "bg-emerald-50/40 border-emerald-200"
                            : "bg-rose-50/40 border-rose-200"
                        }`}
                      >
                        <div
                          onClick={() => setExpandedCardIdx(isExpanded ? null : idx)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSkipped
                                  ? "bg-slate-300 text-slate-700"
                                  : isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  {q.subjectName} • {q.chapterName}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isSkipped
                                      ? "bg-amber-100 text-amber-800"
                                      : isCorrect
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {isSkipped ? "Skipped" : isCorrect ? "Correct (+4)" : "Incorrect (-1)"}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 mt-0.5 block">
                                {isSkipped ? (
                                  <span>Not attempted • Correct Answer: <strong>Option {q.correctOption}</strong></span>
                                ) : (
                                  <span>
                                    Selected: <strong>Option {attempt.selectedAnswer}</strong> (Correct: Option {q.correctOption})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-mono text-[11px] text-slate-600 block">
                                {isSkipped ? "⏱ 0s" : `⏱ ${attempt.timeSpentSeconds}s`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isExpanded ? "Hide Solution" : "View Solution"}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 bg-white/70 space-y-3 text-xs">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800">
                              <KaTeXRenderer content={q.questionText} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((opt) => {
                                const isCorrectChoice = opt.key === q.correctOption;
                                const isUserChoice = attempt?.selectedAnswer === opt.key;

                                return (
                                  <div
                                    key={opt.key}
                                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                                      isCorrectChoice
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
                                        : isUserChoice
                                        ? "bg-rose-50 border-rose-300 text-rose-950"
                                        : "bg-slate-50 border-slate-200 text-slate-700"
                                    }`}
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                        isCorrectChoice
                                          ? "bg-emerald-600 text-white"
                                          : isUserChoice
                                          ? "bg-rose-600 text-white"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {opt.key}
                                    </span>
                                    <div className="flex-1">
                                      <KaTeXRenderer content={opt.text} />
                                    </div>
                                    {isCorrectChoice && (
                                      <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                                        ✓ Correct
                                      </span>
                                    )}
                                    {isUserChoice && !isCorrectChoice && (
                                      <span className="text-[10px] font-bold text-rose-700 shrink-0">
                                        ✗ Your Choice
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-lg text-slate-800 space-y-1">
                                <span className="font-bold text-[11px] text-sky-900 flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-sky-700" /> NCERT Detailed Solution
                                </span>
                                <div className="text-slate-700 text-xs leading-relaxed">
                                  <KaTeXRenderer content={q.explanation} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTIC NTA CBT ENGINE PRACTICE SCREEN
  // =========================================================================
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-800 select-none">
      
      {/* Resumed Active Session Toast Banner */}
      {resumedToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">{resumedToast}</span>
          </div>
          <button 
            onClick={handleStartFresh}
            className="text-[11px] bg-emerald-800 hover:bg-emerald-900 px-2 py-0.5 rounded font-bold transition underline"
          >
            Reset Drill
          </button>
        </div>
      )}

      {/* 1. TOP HEADER (NTA NEET CBT Standard) */}
      <header className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white text-lg">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                {mode === "daily_neet"
                  ? "Today's NEETora 30"
                  : mode === "adaptive"
                  ? "30-Question Recovery Set"
                  : mode === "mistakes"
                  ? "Mistake Book Re-Test"
                  : "NEETora CBT"}
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                {mode === "daily_neet"
                  ? "Daily Regimen"
                  : mode === "adaptive"
                  ? "Adaptive Mode"
                  : mode === "mistakes"
                  ? "Remediation"
                  : "Practice Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Total: {totalQuestions} Questions | Pattern: NTA NEET (+4.00, -1.00)
            </p>
          </div>
        </div>

        {/* Timers & Candidate Profile Header */}
        <div className="flex items-center gap-4">
          
          {/* Question Stopwatch */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Q Time:</span>
            <span className="font-mono font-bold text-amber-300">{formatTime(questionTimer)}</span>
          </div>

          {/* Total Elapsed Drill Timer */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded text-xs">
            <span className="text-slate-400 text-[11px]">Total Time:</span>
            <span className="font-mono font-bold text-sky-300">{formatTime(totalTimer)}</span>
          </div>

          {/* Quick Exit */}
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded border border-slate-700 hover:bg-slate-800 transition"
          >
            Exit Drill
          </Link>
        </div>
      </header>

      {/* 2. SUBJECT SECTION TABS (Physics, Chemistry, Botany, Zoology) */}
      <div className="bg-slate-800 text-white px-5 py-1 flex items-center space-x-1 border-b border-slate-700 flex-shrink-0 text-xs font-semibold overflow-x-auto">
        <span className="text-slate-400 text-[11px] mr-2">Sections:</span>
        {subjectList.map((subName) => {
          const isSelected = subName === currentSubjectName;
          const subQuestions = questions.filter((q) => q.subjectName === subName);
          const firstIndex = questions.findIndex((q) => q.subjectName === subName);

          return (
            <button
              key={subName}
              onClick={() => navigateToQuestion(firstIndex)}
              className={`px-3 py-1.5 rounded-t text-xs font-bold transition flex items-center gap-1.5 ${
                isSelected
                  ? "bg-slate-100 text-slate-900 border-t-2 border-sky-500 shadow-sm"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{subName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? "bg-slate-200 text-slate-800" : "bg-slate-900 text-slate-400"
              }`}>
                {subQuestions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE: LEFT 75% QUESTION CANVAS + RIGHT 25% PALETTE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 75% QUESTION CANVAS (Scrollable)                             */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-300">
          
          {/* Question Sub-Header Bar */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                Question No. {currentIndex + 1}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {currentQuestion.subjectName}
              </span>
              <span className="text-xs text-slate-500">
                {currentQuestion.chapterName}
              </span>
            </div>

            {/* Marking Scheme Badge */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                +4.00
              </span>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                -1.00
              </span>
            </div>
          </div>

          {/* Question Content & Options (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Question Text */}
            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed pb-2 border-b border-slate-100">
              <KaTeXRenderer content={currentQuestion.questionText} />
            </div>

            {/* 4 Option Rows (A, B, C, D) */}
            <div className="space-y-3 max-w-3xl">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.key;
                const isCorrectAnswer = option.key === currentQuestion.correctOption;

                // Color styles
                let optionClasses = "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800";
                let circleClasses = "border-slate-300 text-slate-600 bg-white";

                if (isSubmitted) {
                  if (isCorrectAnswer) {
                    optionClasses = "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-1 ring-emerald-400";
                    circleClasses = "bg-emerald-600 border-emerald-600 text-white font-black";
                  } else if (isSelected && !isCorrectAnswer) {
                    optionClasses = "bg-rose-50 border-rose-500 text-rose-950 shadow-sm ring-1 ring-rose-400";
                    circleClasses = "bg-rose-600 border-rose-600 text-white font-black";
                  } else {
                    optionClasses = "opacity-40 bg-slate-50 border-slate-200 text-slate-500";
                  }
                }

                return (
                  <div
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${optionClasses}`}
                  >
                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${circleClasses}`}>
                        {isSubmitted && isCorrectAnswer ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isSubmitted && isSelected && !isCorrectAnswer ? (
                          <X className="w-4 h-4 stroke-[3]" />
                        ) : (
                          option.key
                        )}
                      </div>
                      <div className="leading-snug">
                        <KaTeXRenderer content={option.text} />
                      </div>
                    </div>

                    {isSubmitted && isCorrectAnswer && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                      </span>
                    )}
                    {isSubmitted && isSelected && !isCorrectAnswer && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Your Choice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Practice Mode Instant Feedback & KaTeX Scientific Explanation */}
            {isSubmitted && (
              <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in duration-200 max-w-3xl">


                {/* Explanation Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>NCERT Line-by-Line Solution</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    <KaTeXRenderer content={currentQuestion.explanation} />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Fixed Action Bar */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                  markedForReview[currentIndex]
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>{markedForReview[currentIndex] ? "Marked for Review ✓" : "Mark for Review"}</span>
              </button>

              <button
                type="button"
                onClick={handleStartFresh}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-100 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Drill</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
              >
                &larr; Previous
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitDrill}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1"
                >
                  <span>Submit Practice</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 25% QUESTION PALETTE & SUBMIT (CBT Standard Layout)          */}
        {/* ========================================================================= */}
        <aside className="w-72 sm:w-80 bg-slate-50 flex flex-col justify-between overflow-hidden flex-shrink-0">
          
          {/* Top of Palette: Candidate Card & Legend */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 border-b border-slate-200">
            
            {/* Candidate Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center space-x-3 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-xs text-slate-900 block truncate">Future Doctor</span>
                <span className="text-[10px] text-slate-400 block font-mono">NEET 2027 Aspirant</span>
              </div>
            </div>

            {/* Legend Matrix */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-[11px]">
              <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 block">
                Palette Legend
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">
                    ✓
                  </span>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[9px]">
                    ✗
                  </span>
                  <span>Incorrect</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-purple-500 text-white flex items-center justify-center font-bold text-[9px]">
                    •
                  </span>
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[9px]">
                    •
                  </span>
                  <span>Not Visited</span>
                </div>
              </div>
            </div>

            {/* Question Palette Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Question Palette</span>
                <span className="text-[11px] text-slate-400">
                  {Object.keys(attempts).length} / {totalQuestions} Answered
                </span>
              </div>

              {/* Grid of 34x34px buttons */}
              <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                {questions.map((q, idx) => {
                  const attempt = attempts[idx];
                  const isCurrent = idx === currentIndex;
                  const isReview = markedForReview[idx];

                  let btnStyle = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";

                  if (attempt) {
                    if (attempt.isCorrect) {
                      btnStyle = "bg-emerald-600 text-white border-emerald-700 font-black shadow-xs";
                    } else {
                      btnStyle = "bg-rose-600 text-white border-rose-700 font-black shadow-xs";
                    }
                  } else if (isReview) {
                    btnStyle = "bg-purple-600 text-white border-purple-700 font-bold";
                  }

                  if (isCurrent) {
                    btnStyle += " ring-2 ring-sky-500 ring-offset-1 scale-105";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateToQuestion(idx)}
                      className={`h-9 w-9 rounded-lg border text-xs font-bold transition flex items-center justify-center ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Submit Action inside Palette */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-2 flex-shrink-0">
            <button
              onClick={handleSubmitDrill}
              className="w-full py-3 bg-[#06382c] hover:bg-[#084a3b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit Practice Session</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Submit anytime to view full speed & accuracy scorecard.
            </p>
          </div>

        </aside>

      </div>

    </div>
  );
}

export default function PracticeModeCBTPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Loading Practice Engine...</p>
          </div>
        </div>
      }
    >
      <PracticeContent />
    </React.Suspense>
  );
}
