"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronLeft,
  User,
  BookmarkCheck,
  Send,
  Flag,
  Eraser,
  FileCheck2,
  Check,
  X,
  BookOpen,
  Target,
  Zap,
  BarChart3,
  Dna,
  Flame,
  Brain,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";
import { getMockExamQuestions } from "@/lib/data/mock-exam-questions";
import { QuestionStatus, ExamAnswerRecord } from "@/lib/data/exam-attempts";
import { StoredQuestion } from "@/lib/data/sample-questions";
import { generateAttemptDna } from "@/lib/data/attempt-dna";
import { MISTAKE_REASONS, MistakeReason } from "@/lib/data/mistake-book";

const EXAM_ACTIVE_KEY = "neetora_active_exam_session";

export default function ExamModePage() {
  const router = useRouter();

  // Load 180 questions (45 Physics, 45 Chemistry, 45 Botany, 45 Zoology)
  const [questions] = useState<StoredQuestion[]>(() => getMockExamQuestions());
  const totalQuestions = questions.length; // 180

  // Top-level session state: "instructions" | "cbt" | "scorecard"
  const [examStatus, setExamStatus] = useState<"instructions" | "cbt" | "scorecard">("instructions");
  const [hasAgreedDeclaration, setHasAgreedDeclaration] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Hindi">("English");

  // Attempt metadata from server
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [submissionReason, setSubmissionReason] = useState<"manual" | "timer_expired" | "browser_back" | null>(null);

  // Active question index (0 to 179)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers record for all 180 questions
  const [answers, setAnswers] = useState<Record<number, ExamAnswerRecord>>({});

  // Server-authoritative timer countdown (seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(180 * 60);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation modal on manual submit click
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Result scorecard data
  const [scorecardData, setScorecardData] = useState<any | null>(null);
  const [scorecardFilter, setScorecardFilter] = useState<"all" | "correct" | "incorrect" | "skipped">("all");
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

  // Mistake reason classification state for post-exam review
  const [mistakeClassifications, setMistakeClassifications] = useState<Record<number, MistakeReason>>({});
  const [savingMistakeIdx, setSavingMistakeIdx] = useState<number | null>(null);

  const handleClassifyQuestion = async (qIdx: number, reason: MistakeReason) => {
    setSavingMistakeIdx(qIdx);
    setMistakeClassifications((prev) => ({ ...prev, [qIdx]: reason }));
    try {
      await fetch("/api/mistakes/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mistakeId: `mstk-${attemptId || "mock-01"}-${qIdx}`,
          reason,
        }),
      });
    } catch (err) {
      console.error("Failed to save classification", err);
    } finally {
      setSavingMistakeIdx(null);
    }
  };

  const currentQuestion = questions[currentIndex] || questions[0];

  // Subject sections helper
  const sections = [
    { name: "Physics", start: 0, end: 44, total: 45 },
    { name: "Chemistry", start: 45, end: 89, total: 45 },
    { name: "Botany", start: 90, end: 134, total: 45 },
    { name: "Zoology", start: 135, end: 179, total: 45 },
  ];

  const currentSection = sections.find((s) => currentIndex >= s.start && currentIndex <= s.end) || sections[0];

  // Refs for stable callback access without re-triggering effects
  const answersRef = useRef<Record<number, ExamAnswerRecord>>({});
  answersRef.current = answers;

  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = attemptId;

  const isSubmittingRef = useRef(false);
  isSubmittingRef.current = isSubmitting;

  const examStatusRef = useRef(examStatus);
  examStatusRef.current = examStatus;

  const hasRestoredRef = useRef(false);

  // =========================================================================
  // SUBMISSION LOGIC (Manual, Auto on Time=0, or on Browser Back)
  // =========================================================================
  const computeFallbackScorecard = useCallback(
    (
      reason: "manual" | "timer_expired" | "browser_back",
      currAnswers: Record<number, ExamAnswerRecord>,
      currAttemptId: string | null
    ) => {
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      let phyCorrect = 0, phyIncorrect = 0, phyUnattempted = 0;
      let chemCorrect = 0, chemIncorrect = 0, chemUnattempted = 0;
      let bioCorrect = 0, bioIncorrect = 0, bioUnattempted = 0;

      questions.forEach((q, idx) => {
        const rec = currAnswers[idx];
        const isSkipped = !rec || !rec.selectedOption;
        const isCorrect = !isSkipped && rec.selectedOption === q.correctOption;
        const isIncorrect = !isSkipped && rec.selectedOption !== q.correctOption;

        if (isSkipped) {
          unattempted++;
        } else if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }

        if (idx < 45) {
          if (isSkipped) phyUnattempted++;
          else if (isCorrect) phyCorrect++;
          else phyIncorrect++;
        } else if (idx < 90) {
          if (isSkipped) chemUnattempted++;
          else if (isCorrect) chemCorrect++;
          else chemIncorrect++;
        } else {
          if (isSkipped) bioUnattempted++;
          else if (isCorrect) bioCorrect++;
          else bioIncorrect++;
        }
      });

      const score = correct * 4 - incorrect * 1;
      const attemptedCount = correct + incorrect;
      const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;

      const phyScore = phyCorrect * 4 - phyIncorrect * 1;
      const phyAttempted = phyCorrect + phyIncorrect;
      const phyAccuracy = phyAttempted > 0 ? Math.round((phyCorrect / phyAttempted) * 100) : 0;

      const chemScore = chemCorrect * 4 - chemIncorrect * 1;
      const chemAttempted = chemCorrect + chemIncorrect;
      const chemAccuracy = chemAttempted > 0 ? Math.round((chemCorrect / chemAttempted) * 100) : 0;

      const bioScore = bioCorrect * 4 - bioIncorrect * 1;
      const bioAttempted = bioCorrect + bioIncorrect;
      const bioAccuracy = bioAttempted > 0 ? Math.round((bioCorrect / bioAttempted) * 100) : 0;

      const totalTimeSpentSeconds = Math.max(0, 180 * 60 - remainingSeconds);
      const avgTimePerQuestionSeconds = attemptedCount > 0 ? Math.round(totalTimeSpentSeconds / attemptedCount) : 0;

      setScorecardData({
        attemptId: currAttemptId || "offline-session",
        testTitle: "All-India NEET Full Syllabus Mock Exam (180 Questions)",
        totalQuestions: 180,
        score,
        correctCount: correct,
        incorrectCount: incorrect,
        unattemptedCount: unattempted,
        accuracy,
        totalTimeSpentSeconds,
        avgTimePerQuestionSeconds,
        subjectScores: {
          physics: {
            subjectName: "Physics",
            totalQuestions: 45,
            maxMarks: 180,
            score: phyScore,
            correctCount: phyCorrect,
            incorrectCount: phyIncorrect,
            unattemptedCount: phyUnattempted,
            accuracy: phyAccuracy,
          },
          chemistry: {
            subjectName: "Chemistry",
            totalQuestions: 45,
            maxMarks: 180,
            score: chemScore,
            correctCount: chemCorrect,
            incorrectCount: chemIncorrect,
            unattemptedCount: chemUnattempted,
            accuracy: chemAccuracy,
          },
          biology: {
            subjectName: "Biology",
            totalQuestions: 90,
            maxMarks: 360,
            score: bioScore,
            correctCount: bioCorrect,
            incorrectCount: bioIncorrect,
            unattemptedCount: bioUnattempted,
            accuracy: bioAccuracy,
          },
        },
        submissionReason: reason,
        answers: currAnswers,
      });
    },
    [questions, remainingSeconds]
  );

  const triggerExamSubmission = useCallback(
    async (reason: "manual" | "timer_expired" | "browser_back") => {
      if (isSubmittingRef.current || examStatusRef.current === "scorecard") return;
      setIsSubmitting(true);
      setSubmissionReason(reason);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

      try {
        localStorage.removeItem(EXAM_ACTIVE_KEY);
      } catch {}

      const currentAnswers = answersRef.current;
      const currentAttemptId = attemptIdRef.current;

      try {
        const res = await fetch("/api/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: currentAttemptId || `att-${Date.now()}`,
            idempotencyKey: `idemp-${currentAttemptId || Date.now()}`,
            reason,
            answers: currentAnswers,
          }),
        });
        const data = await res.json();
        if (data.success && data.attempt) {
          setScorecardData(data.attempt);
        } else {
          computeFallbackScorecard(reason, currentAnswers, currentAttemptId);
        }

        // Auto-save all wrong answers to Mistake Book
        try {
          const wrongMistakes: any[] = [];
          for (let i = 0; i < questions.length; i++) {
            const rec = currentAnswers[i];
            const q = questions[i];
            if (rec?.selectedOption && rec.selectedOption !== q.correctOption) {
              wrongMistakes.push({
                id: `mstk-${currentAttemptId || "exam"}-${i}`,
                questionId: q.id,
                questionIndex: i,
                subject: i < 45 ? "Physics" : i < 90 ? "Chemistry" : "Biology",
                chapterName: q.chapterName,
                topicName: q.topicName,
                questionText: q.questionText,
                options: q.options,
                selectedOption: rec.selectedOption,
                correctOption: q.correctOption,
                explanation: q.explanation,
                timeSpentSeconds: rec.timeSpentSeconds || 60,
                sourceExamId: currentAttemptId || "test-mock-full-180",
                sourceExamTitle: "All-India NEET Full Syllabus Mock Exam (180 Questions)",
                timestamp: new Date().toISOString(),
                isResolved: false,
              });
            }
          }
          if (wrongMistakes.length > 0) {
            fetch("/api/mistakes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mistakes: wrongMistakes }),
            }).catch(() => {});
          }
        } catch (e) {
          console.error("Failed to catalog mistakes", e);
        }
      } catch (err) {
        console.error("Submission failed, fallback local scorecard:", err);
        computeFallbackScorecard(reason, currentAnswers, currentAttemptId);
      } finally {
        setIsSubmitting(false);
        setShowSubmitModal(false);
        setExamStatus("scorecard");
      }
    },
    [computeFallbackScorecard, questions]
  );

  // =========================================================================
  // 1. REFRESH RESTORATION (Timer does not reset, continues from server expires_at)
  // =========================================================================
  useEffect(() => {
    if (typeof window === "undefined" || hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    try {
      const saved = localStorage.getItem(EXAM_ACTIVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.attemptId && parsed.expiresAt && !parsed.isSubmitted) {
          const now = Date.now();
          const expireTime = new Date(parsed.expiresAt).getTime();
          const remaining = Math.max(0, Math.floor((expireTime - now) / 1000));

          if (remaining > 0) {
            setAttemptId(parsed.attemptId);
            setStartedAt(parsed.startedAt);
            setExpiresAt(parsed.expiresAt);
            setAnswers(parsed.answers || {});
            setCurrentIndex(typeof parsed.currentIndex === "number" ? parsed.currentIndex : 0);
            setRemainingSeconds(remaining);
            setExamStatus("cbt");
          } else {
            // Already expired while away
            triggerExamSubmission("timer_expired");
          }
        }
      }
    } catch (err) {
      console.error("Failed to restore session from storage", err);
    }
  }, [triggerExamSubmission]);

  // =========================================================================
  // 2. BROWSER BACK BUTTON SAFETY: SUBMIT EXAM IF STUDENT PRESSES BACK
  // =========================================================================
  useEffect(() => {
    if (examStatus !== "cbt") return;

    // Push a state into browser history so back button can be intercepted
    window.history.pushState({ inExam: true }, "", window.location.href);

    const handlePopState = () => {
      // User pressed browser back button -> Auto-submit exam immediately
      triggerExamSubmission("browser_back");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [examStatus, triggerExamSubmission]);

  // Network connection resilience & instant auto-reconnect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      if (attemptIdRef.current) {
        fetch("/api/exam/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: attemptIdRef.current,
            answers: answersRef.current,
            currentQuestionIndex: currentIndex,
          }),
        }).catch(() => {});
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentIndex]);

  // =========================================================================
  // 3. SERVER COUNTDOWN TIMER & AUTO-SUBMIT AT 0
  // =========================================================================
  useEffect(() => {
    if (examStatus !== "cbt" || !expiresAt) return;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const expireTime = new Date(expiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((expireTime - now) / 1000));

      setRemainingSeconds(diffSecs);

      // Auto Submit when remaining time reaches 0
      if (diffSecs <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        triggerExamSubmission("timer_expired");
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [examStatus, expiresAt, triggerExamSubmission]);

  // =========================================================================
  // 4. PERIODIC AUTO-SAVE SYNC (Every 15 seconds)
  // =========================================================================
  useEffect(() => {
    if (examStatus !== "cbt" || !attemptId) return;

    // Local real-time backup
    try {
      localStorage.setItem(
        EXAM_ACTIVE_KEY,
        JSON.stringify({
          attemptId,
          startedAt,
          expiresAt,
          answers,
          currentIndex,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch {}

    syncIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/exam/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            answers,
            currentQuestionIndex: currentIndex,
          }),
        });
        const data = await res.json();
        if (data.hasExpired || data.isSubmitted) {
          triggerExamSubmission("timer_expired");
        }
      } catch (err) {
        console.error("Auto-sync background error:", err);
      }
    }, 15000);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, [examStatus, attemptId, startedAt, expiresAt, answers, currentIndex, triggerExamSubmission]);

  // =========================================================================
  // HANDLERS: START EXAM
  // =========================================================================
  const handleStartExam = async () => {
    if (!hasAgreedDeclaration) {
      alert("Please accept the declaration before starting the exam.");
      return;
    }

    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: "test-mock-01",
          testTitle: "NEET Full Mock #01",
          totalQuestions: 180,
          durationMinutes: 180,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setAttemptId(data.attemptId);
        setStartedAt(data.attempt_started_at);
        setExpiresAt(data.attempt_expires_at);
        setRemainingSeconds(data.durationMinutes * 60);

        // Initialize question answers
        const initialAnswers = data.answers || {};
        setAnswers(initialAnswers);
        setCurrentIndex(0);

        // Cache for refresh continuation
        try {
          localStorage.setItem(
            EXAM_ACTIVE_KEY,
            JSON.stringify({
              attemptId: data.attemptId,
              startedAt: data.attempt_started_at,
              expiresAt: data.attempt_expires_at,
              answers: initialAnswers,
              currentIndex: 0,
            })
          );
        } catch {}

        setExamStatus("cbt");
      }
    } catch (err) {
      console.error("Failed to start exam:", err);
      alert("Failed to initialize exam session. Please try again.");
    }
  };

  // Option selection
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => {
      const current = prev[currentIndex] || {
        selectedOption: null,
        status: "not_answered",
        timeSpentSeconds: 0,
        lastUpdated: new Date().toISOString(),
      };

      return {
        ...prev,
        [currentIndex]: {
          ...current,
          selectedOption: key,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  };

  // Save & Next
  const handleSaveAndNext = () => {
    const current = answers[currentIndex];
    const hasSelection = !!current?.selectedOption;

    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selectedOption: current?.selectedOption || null,
        status: hasSelection ? "answered" : "not_answered",
        timeSpentSeconds: (current?.timeSpentSeconds || 0) + 1,
        lastUpdated: new Date().toISOString(),
      },
    }));

    if (currentIndex < totalQuestions - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const current = answers[currentIndex];
    const hasSelection = !!current?.selectedOption;

    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selectedOption: current?.selectedOption || null,
        status: hasSelection ? "answered_and_marked" : "marked_for_review",
        timeSpentSeconds: (current?.timeSpentSeconds || 0) + 1,
        lastUpdated: new Date().toISOString(),
      },
    }));

    if (currentIndex < totalQuestions - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  // Clear Response
  const handleClearResponse = () => {
    const current = answers[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selectedOption: null,
        status: "not_answered",
        timeSpentSeconds: current?.timeSpentSeconds || 0,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  // Previous
  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigateToQuestion(currentIndex - 1);
    }
  };

  // Navigation to specific index
  const navigateToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= totalQuestions) return;

    setAnswers((prev) => {
      const targetRecord = prev[targetIdx];
      // If never visited, change to not_answered
      if (!targetRecord || targetRecord.status === "not_visited") {
        return {
          ...prev,
          [targetIdx]: {
            selectedOption: null,
            status: "not_answered",
            timeSpentSeconds: 0,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      return prev;
    });

    setCurrentIndex(targetIdx);
  };

  // Format timer as HH:MM:SS
  const formatCountdown = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Live status counts for palette
  const answeredCount = Object.values(answers).filter(
    (a) => a.status === "answered" || a.status === "answered_and_marked"
  ).length;

  const notAnsweredCount = Object.values(answers).filter(
    (a) => a.status === "not_answered"
  ).length;

  const markedForReviewCount = Object.values(answers).filter(
    (a) => a.status === "marked_for_review"
  ).length;

  const answeredAndMarkedCount = Object.values(answers).filter(
    (a) => a.status === "answered_and_marked"
  ).length;

  const notVisitedCount = totalQuestions - Object.keys(answers).length;

  // Palette status helper
  const getQuestionPaletteStyle = (idx: number) => {
    const isCurrent = idx === currentIndex;
    const rec = answers[idx];
    const status: QuestionStatus = rec?.status || "not_visited";

    let bgStyle = "bg-slate-100 text-slate-700 border-slate-300"; // not_visited

    if (status === "answered") {
      bgStyle = "bg-[#22c55e] text-white border-[#16a34a] font-black"; // Green
    } else if (status === "not_answered") {
      bgStyle = "bg-[#ef4444] text-white border-[#dc2626] font-black"; // Red
    } else if (status === "marked_for_review") {
      bgStyle = "bg-[#8b5cf6] text-white border-[#7c3aed] font-black"; // Purple
    } else if (status === "answered_and_marked") {
      bgStyle = "bg-[#8b5cf6] text-white border-[#7c3aed] font-black relative"; // Purple with dot
    }

    const currentOutline = isCurrent ? "ring-2 ring-amber-400 ring-offset-1 scale-105" : "";

    return `${bgStyle} ${currentOutline}`;
  };

  // =========================================================================
  // VIEW: START SCREEN & OFFICIAL INSTRUCTIONS
  // =========================================================================
  if (examStatus === "instructions") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* Official Header */}
        <header className="bg-slate-900 text-white px-6 lg:px-12 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-sky-500 rounded-lg flex items-center justify-center font-black text-white text-xl">
              N
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                NEET Full Mock #01
              </h1>
              <p className="text-[11px] text-slate-400">National Eligibility cum Entrance Test (UG) Simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:inline">Exam Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="bg-slate-800 text-white border border-slate-700 text-xs px-2.5 py-1 rounded focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </header>

        {/* Instructions Body */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            
            {/* Title & Key Parameters */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    NEET Full Mock #01
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Authentic Computer Based Examination (CBT) conforming to the standard NTA Pattern.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold">
                    ⏱ 180 Minutes
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                    📝 180 Questions
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                    ⚖ +4 / -1 Marking
                  </span>
                </div>
              </div>
            </div>

            {/* Test Structure & Syllabus Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">Physics</span>
                <span className="text-slate-500">Q1 - Q45</span>
                <span className="font-semibold text-emerald-600 block mt-1">180 Marks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">Chemistry</span>
                <span className="text-slate-500">Q46 - Q90</span>
                <span className="font-semibold text-emerald-600 block mt-1">180 Marks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">Botany</span>
                <span className="text-slate-500">Q91 - Q135</span>
                <span className="font-semibold text-emerald-600 block mt-1">180 Marks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm">Zoology</span>
                <span className="text-slate-500">Q136 - Q180</span>
                <span className="font-semibold text-emerald-600 block mt-1">180 Marks</span>
              </div>
            </div>

            {/* Standard Instructions */}
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                General Instructions for Candidate:
              </h3>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Total duration of the examination is <strong>180 minutes (3 Hours)</strong>.
                </li>
                <li>
                  The clock will be set at the server. The countdown timer at the top right of screen will display the remaining time available for you to complete the examination.
                </li>
                <li>
                  <strong>Automatic Submission:</strong> When the timer reaches zero (00:00:00), the examination will end automatically. You will not be required to manually submit once time expires.
                </li>
                <li>
                  <strong>Browser Navigation Protection:</strong> If you attempt to press the browser back button, your test session will be securely finalized and submitted immediately.
                </li>
                <li>
                  <strong>Marking Scheme:</strong> For each correct response, candidate gets <strong>+4 marks</strong>. For each incorrect response, <strong>-1 mark</strong> will be deducted. Unattempted questions award <strong>0 marks</strong>.
                </li>
              </ul>

              {/* Palette Legend */}
              <div className="pt-2">
                <span className="font-bold text-slate-900 block mb-2">Question Palette Status Colors:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#22c55e] text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#ef4444] text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-[10px] relative">
                      4
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full absolute bottom-0.5 right-0.5"></span>
                    </span>
                    <span>Answered & Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      5
                    </span>
                    <span>Not Visited</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Declaration */}
            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreedDeclaration}
                  onChange={(e) => setHasAgreedDeclaration(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs text-slate-800 leading-normal">
                  I have read and understood all the instructions given above. I declare that I will strictly abide by all the rules and maintain the integrity of this examination.
                </span>
              </label>
            </div>

            {/* Start Button */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleStartExam}
                disabled={!hasAgreedDeclaration}
                className={`px-10 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition flex items-center gap-2 ${
                  hasAgreedDeclaration
                    ? "bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Start Exam</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: SCORECARD & POST-SUBMISSION ANALYSIS
  // =========================================================================
  if (examStatus === "scorecard") {
    const sc = scorecardData || {};
    const totalScore = sc.score ?? 0;
    const correctCount = sc.correctCount ?? 0;
    const incorrectCount = sc.incorrectCount ?? 0;
    const unattemptedCount = sc.unattemptedCount ?? (totalQuestions - (correctCount + incorrectCount));
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = sc.accuracy ?? (attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0);

    // Subject Scores (Physics 45, Chemistry 45, Biology 90)
    const subScores = sc.subjectScores || {
      physics: (() => {
        let cor = 0, inc = 0, un = 0;
        for (let i = 0; i < 45; i++) {
          const a = answers[i];
          if (!a?.selectedOption) un++;
          else if (a.selectedOption === questions[i].correctOption) cor++;
          else inc++;
        }
        const s = cor * 4 - inc * 1;
        const att = cor + inc;
        return {
          subjectName: "Physics",
          totalQuestions: 45,
          maxMarks: 180,
          score: s,
          correctCount: cor,
          incorrectCount: inc,
          unattemptedCount: un,
          accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
        };
      })(),
      chemistry: (() => {
        let cor = 0, inc = 0, un = 0;
        for (let i = 45; i < 90; i++) {
          const a = answers[i];
          if (!a?.selectedOption) un++;
          else if (a.selectedOption === questions[i].correctOption) cor++;
          else inc++;
        }
        const s = cor * 4 - inc * 1;
        const att = cor + inc;
        return {
          subjectName: "Chemistry",
          totalQuestions: 45,
          maxMarks: 180,
          score: s,
          correctCount: cor,
          incorrectCount: inc,
          unattemptedCount: un,
          accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
        };
      })(),
      biology: (() => {
        let cor = 0, inc = 0, un = 0;
        for (let i = 90; i < 180; i++) {
          const a = answers[i];
          if (!a?.selectedOption) un++;
          else if (a.selectedOption === questions[i].correctOption) cor++;
          else inc++;
        }
        const s = cor * 4 - inc * 1;
        const att = cor + inc;
        return {
          subjectName: "Biology",
          totalQuestions: 90,
          maxMarks: 360,
          score: s,
          correctCount: cor,
          incorrectCount: inc,
          unattemptedCount: un,
          accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
        };
      })(),
    };

    // Time calculations
    const totalTimeSpent = sc.totalTimeSpentSeconds ?? Math.max(0, 180 * 60 - remainingSeconds);
    const avgSpeed = sc.avgTimePerQuestionSeconds ?? (attemptedCount > 0 ? Math.round(totalTimeSpent / attemptedCount) : 0);

    const formatTimeTaken = (secs: number) => {
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m ${s.toString().padStart(2, "0")}s`;
    };

    const dnaReport = generateAttemptDna({
      score: totalScore,
      accuracy,
      totalTimeSpentSeconds: totalTimeSpent,
      avgTimePerQuestionSeconds: avgSpeed,
      subjectScores: {
        physics: { score: subScores.physics.score, accuracy: subScores.physics.accuracy, incorrectCount: subScores.physics.incorrectCount },
        chemistry: { score: subScores.chemistry.score, accuracy: subScores.chemistry.accuracy, incorrectCount: subScores.chemistry.incorrectCount },
        biology: { score: subScores.biology.score, accuracy: subScores.biology.accuracy, incorrectCount: subScores.biology.incorrectCount },
      },
      examTitle: "NEET Full Mock #01",
    });

    const filteredQuestions = questions
      .map((q, idx) => ({ q, idx, attempt: answers[idx] }))
      .filter(({ q, attempt }) => {
        const isAttempted = !!attempt?.selectedOption;
        const isCorrect = isAttempted && attempt.selectedOption === q.correctOption;
        const isIncorrect = isAttempted && attempt.selectedOption !== q.correctOption;
        const isSkipped = !isAttempted;

        if (scorecardFilter === "correct") return isCorrect;
        if (scorecardFilter === "incorrect") return isIncorrect;
        if (scorecardFilter === "skipped") return isSkipped;
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
                NEET Full Mock #01 — Official Scorecard
              </h1>
              <p className="text-[11px] text-slate-400">All-India Diagnostic Telemetry & All-Subject Report</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 transition"
          >
            Exit to Home
          </Link>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 border border-emerald-200">
              <Award className="w-12 h-12 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Examination Completed Successfully
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {submissionReason === "timer_expired"
                  ? "Test was automatically submitted as the 180-minute countdown reached zero."
                  : submissionReason === "browser_back"
                  ? "Test was automatically submitted upon detecting browser back navigation."
                  : "Test was submitted manually by the candidate."}
              </p>
            </div>

            {/* 1. RESULT ENGINE PRIMARY SCORE BANNER (Exact Marking Formula Display) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 text-center shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Official NTA NEET Result
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {totalScore} <span className="text-xl sm:text-2xl text-slate-400 font-semibold">/ 720</span>
                </div>
              </div>

              {/* Exact Formula Breakdown Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono font-bold">
                  ✓ Correct: {correctCount} × (+4) = +{correctCount * 4}
                </span>
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-mono font-bold">
                  ✗ Incorrect: {incorrectCount} × (-1) = -{incorrectCount * 1}
                </span>
                <span className="px-3 py-1 bg-slate-700/80 text-slate-300 border border-slate-600 rounded-full font-mono font-bold">
                  ⚪ Unattempted: {unattemptedCount} × (0) = 0
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {totalScore >= 600
                    ? "Government Medical College Qualified (High Merit Rank)"
                    : totalScore >= 450
                    ? "Competitive NEET Range (Merit Qualified)"
                    : "Intensive Revision Recommended"}
                </span>
              </div>
            </div>

            {/* 2. OVERALL ANALYTICS (6 KPI Cards) */}
            <div>
              <div className="text-left mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                  Overall Performance Analytics
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Score</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">{totalScore}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">/ 720</span>
                </div>

                <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">Accuracy</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-700">{accuracy}%</span>
                  <span className="text-[10px] text-indigo-600 block mt-0.5">of attempted</span>
                </div>

                <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-sky-700 block mb-1">Attempted</span>
                  <span className="text-xl sm:text-2xl font-black text-sky-900">{attemptedCount}</span>
                  <span className="text-[10px] text-sky-600 block mt-0.5">/ {totalQuestions}</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1 flex items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Correct
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">{correctCount}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">+{correctCount * 4} M</span>
                </div>

                <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1 flex items-center justify-center gap-0.5">
                    <XCircle className="w-3 h-3 text-rose-600" /> Incorrect
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-700">{incorrectCount}</span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">-{incorrectCount * 1} M</span>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1 flex items-center justify-center gap-0.5">
                    <HelpCircle className="w-3 h-3 text-amber-600" /> Unattempted
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-700">{unattemptedCount}</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">0 penalty</span>
                </div>
              </div>
            </div>

            {/* 3. SUBJECT-WISE ANALYTICS (Physics, Chemistry, Biology) */}
            <div>
              <div className="text-left mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Subject-Wise Performance Breakdown
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Physics Card */}
                <div className="p-5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">Section 1</span>
                      <h4 className="text-base font-black text-slate-900">Physics</h4>
                    </div>
                    <span className="text-xl font-black text-sky-700">
                      {subScores.physics.score} <span className="text-xs text-slate-400 font-normal">/ 180</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, Math.round((subScores.physics.score / 180) * 100)))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-xs pt-1">
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100">
                      <span className="text-[9px] text-emerald-700 block font-bold">Correct</span>
                      <span className="font-black text-emerald-800">{subScores.physics.correctCount}</span>
                    </div>
                    <div className="p-1.5 bg-rose-50 rounded border border-rose-100">
                      <span className="text-[9px] text-rose-700 block font-bold">Wrong</span>
                      <span className="font-black text-rose-800">{subScores.physics.incorrectCount}</span>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded border border-amber-100">
                      <span className="text-[9px] text-amber-700 block font-bold">Unattempted</span>
                      <span className="font-black text-amber-800">{subScores.physics.unattemptedCount}</span>
                    </div>
                    <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-600 block font-bold">Accuracy</span>
                      <span className="font-black text-slate-800">{subScores.physics.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Chemistry Card */}
                <div className="p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Section 2</span>
                      <h4 className="text-base font-black text-slate-900">Chemistry</h4>
                    </div>
                    <span className="text-xl font-black text-amber-700">
                      {subScores.chemistry.score} <span className="text-xs text-slate-400 font-normal">/ 180</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, Math.round((subScores.chemistry.score / 180) * 100)))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-xs pt-1">
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100">
                      <span className="text-[9px] text-emerald-700 block font-bold">Correct</span>
                      <span className="font-black text-emerald-800">{subScores.chemistry.correctCount}</span>
                    </div>
                    <div className="p-1.5 bg-rose-50 rounded border border-rose-100">
                      <span className="text-[9px] text-rose-700 block font-bold">Wrong</span>
                      <span className="font-black text-rose-800">{subScores.chemistry.incorrectCount}</span>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded border border-amber-100">
                      <span className="text-[9px] text-amber-700 block font-bold">Unattempted</span>
                      <span className="font-black text-amber-800">{subScores.chemistry.unattemptedCount}</span>
                    </div>
                    <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-600 block font-bold">Accuracy</span>
                      <span className="font-black text-slate-800">{subScores.chemistry.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Biology Card (Botany + Zoology) */}
                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Section 3 & 4 (Botany + Zoology)</span>
                      <h4 className="text-base font-black text-slate-900">Biology</h4>
                    </div>
                    <span className="text-xl font-black text-emerald-700">
                      {subScores.biology.score} <span className="text-xs text-slate-400 font-normal">/ 360</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, Math.round((subScores.biology.score / 360) * 100)))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-xs pt-1">
                    <div className="p-1.5 bg-emerald-50 rounded border border-emerald-100">
                      <span className="text-[9px] text-emerald-700 block font-bold">Correct</span>
                      <span className="font-black text-emerald-800">{subScores.biology.correctCount}</span>
                    </div>
                    <div className="p-1.5 bg-rose-50 rounded border border-rose-100">
                      <span className="text-[9px] text-rose-700 block font-bold">Wrong</span>
                      <span className="font-black text-rose-800">{subScores.biology.incorrectCount}</span>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded border border-amber-100">
                      <span className="text-[9px] text-amber-700 block font-bold">Unattempted</span>
                      <span className="font-black text-amber-800">{subScores.biology.unattemptedCount}</span>
                    </div>
                    <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-600 block font-bold">Accuracy</span>
                      <span className="font-black text-slate-800">{subScores.biology.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. TIME ANALYTICS BAR */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Time Spent</span>
                  <span className="text-lg font-black text-slate-900">{formatTimeTaken(totalTimeSpent)}</span>
                  <span className="text-[10px] text-slate-400 block">/ 180 Minutes allotted</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Speed</span>
                  <span className="text-lg font-black text-emerald-700">{avgSpeed}s</span>
                  <span className="text-[10px] text-slate-400 block">per attempted question</span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">NEET Pacing Benchmark</span>
                <span className={`text-xs font-bold ${avgSpeed <= 60 ? "text-emerald-600" : "text-amber-600"}`}>
                  {avgSpeed <= 60 ? "⚡ Optimal Speed (< 60s/q)" : "⚠ Needs Speed Optimization"}
                </span>
                <span className="text-[10px] text-slate-400 block">Target: 180 Qs in 180 Mins</span>
              </div>
            </div>

            {/* ATTEMPT DNA & COGNITIVE DIAGNOSTICS */}
            <div className="bg-gradient-to-br from-[#06382c] via-[#094738] to-[#04241c] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>NEETora Signature Cognitive Engine</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
                    <Dna className="w-6 h-6 text-emerald-400" />
                    YOUR ATTEMPT DNA
                  </h3>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
                    Multivariate performance diagnostics measuring your knowledge retention, tactical speed, exam hall discipline, and negative marks leakage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/mistakes"
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Mistake Book ({incorrectCount})</span>
                  </Link>
                  <Link
                    href="/analytics"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <span>Full Diagnostic Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 4 Pillars of Attempt DNA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Knowledge */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300 flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5" /> Knowledge
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200">
                      {dnaReport.dnaMetrics.knowledge.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{dnaReport.dnaMetrics.knowledge.score}</span>
                    <span className="text-xs text-sky-200">/ 10</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full"
                      style={{ width: `${(dnaReport.dnaMetrics.knowledge.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-100/70 block">
                    Topper: {dnaReport.dnaMetrics.knowledge.benchmark}
                  </span>
                </div>

                {/* Accuracy */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Accuracy
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                      {dnaReport.dnaMetrics.accuracy.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{dnaReport.dnaMetrics.accuracy.score}</span>
                    <span className="text-xs text-emerald-200">/ 10</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${(dnaReport.dnaMetrics.accuracy.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-100/70 block">
                    Topper: {dnaReport.dnaMetrics.accuracy.benchmark}
                  </span>
                </div>

                {/* Time Management */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Time Mgmt
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                      {dnaReport.dnaMetrics.timeManagement.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{dnaReport.dnaMetrics.timeManagement.score}</span>
                    <span className="text-xs text-amber-200">/ 10</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(dnaReport.dnaMetrics.timeManagement.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-100/70 block">
                    Topper: {dnaReport.dnaMetrics.timeManagement.benchmark}
                  </span>
                </div>

                {/* Consistency */}
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Consistency
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200">
                      {dnaReport.dnaMetrics.consistency.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{dnaReport.dnaMetrics.consistency.score}</span>
                    <span className="text-xs text-purple-200">/ 10</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-400 h-full rounded-full"
                      style={{ width: `${(dnaReport.dnaMetrics.consistency.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-100/70 block">
                    Topper: {dnaReport.dnaMetrics.consistency.benchmark}
                  </span>
                </div>
              </div>

              {/* Score Leaks & Next Best Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Biggest Score Leaks */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase text-rose-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400" /> Biggest Score Leaks
                    </h4>
                    <span className="text-[10px] text-rose-300/80">Ranked by Negative Marks</span>
                  </div>
                  <div className="space-y-2">
                    {dnaReport.biggestScoreLeaks.map((leak) => (
                      <div key={leak.rank} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
                            {leak.rank}
                          </span>
                          <span className="font-semibold text-white">{leak.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-rose-300">
                          +{leak.potentialMarksRecovery} M Leak
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your Next Best Action */}
                <div className="p-4 rounded-2xl bg-black/25 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" /> Your Next Best Action
                      </h4>
                      <span className="text-[10px] text-amber-300/80">Adaptive Prescription</span>
                    </div>
                    <div className="space-y-2 mt-2">
                      {dnaReport.nextBestActions.map((act, i) => (
                        <div key={act.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">{i === 0 ? "1." : i === 1 ? "+" : "+"}</span>
                            <span className="font-bold text-emerald-100">{act.actionText}</span>
                          </div>
                          <span className="text-[10px] text-emerald-300/70 font-mono">
                            ~{act.estimatedMinutes}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/mistakes"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition text-center mt-2"
                  >
                    Launch Prescription Drill &rarr;
                  </Link>
                </div>

              </div>

              {/* Weakness Map & Time Behaviour Quick Insight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 block mb-1">
                    Physics Weakness Map:
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-1 bg-white/10 rounded-lg">Electrostatics 🔴</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg">Current Electricity 🟡</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg">Optics 🟢</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg">Mechanics 🟢</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-300 block mb-1">
                    Detected Time Behaviour:
                  </span>
                  <p className="text-[11px] text-emerald-100/80 leading-snug">
                    {dnaReport.timeBehaviour[0]?.observation}
                  </p>
                </div>
              </div>

            </div>

            {/* 5. QUESTION-BY-QUESTION ANALYSIS */}
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
                    Unattempted ({unattemptedCount})
                  </button>
                </div>
              </div>

              {/* Review Question List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredQuestions.map(({ q, idx, attempt }) => {
                  const isExpanded = expandedCardIdx === idx;
                  const isAttempted = !!attempt?.selectedOption;
                  const isCorrect = isAttempted && attempt.selectedOption === q.correctOption;
                  const isIncorrect = isAttempted && attempt.selectedOption !== q.correctOption;
                  const isSkipped = !isAttempted;

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
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none"
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
                                  Selected: <strong>Option {attempt.selectedOption}</strong> (Correct: Option {q.correctOption})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-sky-700 font-semibold">
                          <span>{isExpanded ? "Hide" : "Solution"}</span>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-200/70 bg-white/70 space-y-3 text-xs">
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800">
                            <KaTeXRenderer content={q.questionText} />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => {
                              const isCorrectChoice = opt.key === q.correctOption;
                              const isUserChoice = attempt?.selectedOption === opt.key;

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

                          {/* Mistake Classification Selector for Wrong Answers */}
                          {isIncorrect && (
                            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 mt-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[11px] text-rose-900 flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Why did you get this wrong?
                                </span>
                                {savingMistakeIdx === idx && (
                                  <span className="text-[10px] text-emerald-700 font-semibold animate-pulse">
                                    Saving...
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
                                {MISTAKE_REASONS.map((r) => {
                                  const isSelected = mistakeClassifications[idx] === r.key;
                                  return (
                                    <button
                                      type="button"
                                      key={r.key}
                                      onClick={() => handleClassifyQuestion(idx, r.key)}
                                      className={`p-1.5 rounded-lg border text-left transition flex items-center gap-1 text-[10px] ${
                                        isSelected
                                          ? "bg-slate-900 text-white border-slate-900 font-bold shadow-sm"
                                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      <span>{r.icon}</span>
                                      <span className="truncate">{r.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/mistakes"
                className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Practice Mistakes ({incorrectCount})</span>
              </Link>
              <Link
                href="/analytics"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-2"
              >
                <Dna className="w-4 h-4" />
                <span>View Full Attempt DNA</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
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
  // VIEW: AUTHENTIC NTA CBT EXAM SIMULATION ENGINE
  // =========================================================================
  const currAttemptRecord = answers[currentIndex];
  const selectedOpt = currAttemptRecord?.selectedOption || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. NTA TOP NAV HEADER */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white text-base">
            N
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>NEET Full Mock #01</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.2 rounded">
                Live CBT
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">180 Questions • 180 Minutes • Standard NTA Simulation</p>
          </div>
        </div>

        {/* Server Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm ${
              remainingSeconds < 300
                ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                : remainingSeconds < 1800
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-slate-800 border-slate-700 text-emerald-400"
            }`}
          >
            <Clock className="w-4 h-4 text-slate-300" />
            <span>Time Left: {formatCountdown(remainingSeconds)}</span>
          </div>
        </div>
      </header>

      {/* Network Connection Resilience Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow z-40 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          <span>Network Connection Lost — All responses preserved in memory. Responses will re-sync automatically upon reconnection.</span>
        </div>
      )}

      {/* 2. SUBJECT SECTIONS TABS (Physics, Chemistry, Botany, Zoology) */}
      <div className="bg-slate-800 text-white px-4 sm:px-6 py-1 flex items-center space-x-1 border-b border-slate-700 flex-shrink-0 text-xs font-semibold overflow-x-auto">
        <span className="text-slate-400 text-[11px] mr-2">Sections:</span>
        {sections.map((sec) => {
          const isSelected = currentSection.name === sec.name;

          return (
            <button
              key={sec.name}
              type="button"
              onClick={() => navigateToQuestion(sec.start)}
              className={`px-3.5 py-1.5 rounded-t text-xs font-bold transition flex items-center gap-1.5 ${
                isSelected
                  ? "bg-white text-slate-900 border-t-2 border-sky-500 shadow-sm"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{sec.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-slate-200 text-slate-800" : "bg-slate-900 text-slate-400"
                }`}
              >
                {sec.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE: LEFT 75% QUESTION CANVAS + RIGHT 25% PALETTE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 75% QUESTION CANVAS                                         */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-300">
          
          {/* Question Header Bar */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                Question No. {currentIndex + 1}
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                {currentQuestion.subjectName}
              </span>
              <span className="text-xs text-slate-500 truncate max-w-xs">
                {currentQuestion.chapterName}
              </span>
            </div>

            {/* Marking Scheme */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                +4.00
              </span>
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                -1.00
              </span>
            </div>
          </div>

          {/* Question Text & 4 Option Rows (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed pb-3 border-b border-slate-100">
              <KaTeXRenderer content={currentQuestion.questionText} />
            </div>

            {/* Options */}
            <div className="space-y-3 max-w-3xl">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOpt === option.key;

                return (
                  <div
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-sky-50/90 border-sky-500 text-sky-950 shadow-sm ring-1 ring-sky-400"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected
                            ? "bg-sky-600 border-sky-600 text-white"
                            : "border-slate-300 text-slate-600 bg-white"
                        }`}
                      >
                        {option.key}
                      </div>
                      <div className="leading-snug">
                        <KaTeXRenderer content={option.text} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Controls Bar (Authentic NTA Action Layout) */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1"
              >
                <Eraser className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear Response</span>
              </button>

              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Mark for Review & Next</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 border font-semibold text-xs rounded-lg transition flex items-center gap-1 ${
                  currentIndex === 0
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 25% QUESTION PALETTE                                       */}
        {/* ========================================================================= */}
        <div className="w-72 sm:w-80 md:w-96 bg-slate-50 flex flex-col overflow-hidden border-l border-slate-200">
          
          {/* Candidate Profile Widget */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div className="leading-tight text-xs">
              <span className="font-bold text-slate-800 block">Candidate: NEET Aspirant</span>
              <span className="text-[11px] text-slate-500 block">Roll No: 2027-UG-18001</span>
            </div>
          </div>

          {/* Official 5-State Legend Counters */}
          <div className="p-3 bg-slate-100 border-b border-slate-200 text-[11px] space-y-1.5 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#22c55e] text-white flex items-center justify-center font-bold text-[10px]">
                  {answeredCount}
                </span>
                <span className="text-slate-700">Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#ef4444] text-white flex items-center justify-center font-bold text-[10px]">
                  {notAnsweredCount}
                </span>
                <span className="text-slate-700">Not Answered</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-[10px]">
                  {markedForReviewCount}
                </span>
                <span className="text-slate-700">Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-[10px] relative">
                  {answeredAndMarkedCount}
                  <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full absolute bottom-0.5 right-0.5"></span>
                </span>
                <span className="text-slate-700">Ans & Marked</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-0.5">
              <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                {notVisitedCount}
              </span>
              <span className="text-slate-700">Not Visited</span>
            </div>
          </div>

          {/* Section Indicator */}
          <div className="px-4 py-2 bg-slate-200/80 border-b border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>{currentSection.name} Palette</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Q{currentSection.start + 1} - Q{currentSection.end + 1}
            </span>
          </div>

          {/* 180 Questions Palette Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: currentSection.total }).map((_, i) => {
                const questionIdx = currentSection.start + i;
                const paletteStyle = getQuestionPaletteStyle(questionIdx);
                const rec = answers[questionIdx];

                return (
                  <button
                    key={questionIdx}
                    type="button"
                    onClick={() => navigateToQuestion(questionIdx)}
                    className={`h-9 w-full rounded border flex items-center justify-center font-bold text-xs transition duration-100 ${paletteStyle}`}
                  >
                    <span>{questionIdx + 1}</span>
                    {rec?.status === "answered_and_marked" && (
                      <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full absolute bottom-1 right-1"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Exam Button at Bottom of Palette */}
          <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBMISSION CONFIRMATION MODAL                                             */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Exam Summary & Final Submission</h3>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Are you sure you want to submit your examination? Once submitted, you cannot change your answers.
              </p>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>Total Questions: <strong>{totalQuestions}</strong></div>
                <div>Answered: <strong className="text-emerald-600">{answeredCount}</strong></div>
                <div>Not Answered: <strong className="text-rose-600">{notAnsweredCount}</strong></div>
                <div>Marked for Review: <strong className="text-purple-600">{markedForReviewCount + answeredAndMarkedCount}</strong></div>
                <div>Not Visited: <strong className="text-slate-500">{notVisitedCount}</strong></div>
                <div>Time Remaining: <strong>{formatCountdown(remainingSeconds)}</strong></div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={() => triggerExamSubmission("manual")}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                >
                  {isSubmitting ? "Submitting..." : "Yes, Submit Exam"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
