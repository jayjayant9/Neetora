import Link from "next/link";
import {
  HelpCircle,
  PlusCircle,
  CheckSquare,
  FileUp,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  Search,
  Filter,
  Flame,
  FileCheck2,
  FileWarning
} from "lucide-react";
import { getAdminIntelligenceData } from "@/lib/data/admin-intelligence";

export default function AdminDashboardPage() {
  const data = getAdminIntelligenceData();
  const { contentHealth, questionQuality, testAnalytics } = data;

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. OVERVIEW & ADMIN INTELLIGENCE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Intelligence Suite</h1>
            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold px-2 py-0.5 rounded-full">
              Operations Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Content health diagnostics, automated extraction quality audits, and candidate test telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/questions/create"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </Link>
          <Link
            href="/admin/pdfs"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Paper PDF</span>
          </Link>
        </div>
      </div>

      {/* 2. CONTENT HEALTH DECK */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Question Bank Integrity
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Content Health Audit
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Audit Cycle: Live Sync
          </span>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Questions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-600" /> Total Questions
            </span>
            <div className="text-2xl font-black font-mono text-slate-900">
              {contentHealth.totalQuestions.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 block">Complete repository corpus</span>
          </div>

          {/* Approved */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved Active
            </span>
            <div className="text-2xl font-black font-mono text-emerald-700">
              {contentHealth.approved.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-800/80 block">
              {contentHealth.approvedPercentage}% of total corpus ready for exams
            </span>
          </div>

          {/* Needs Review */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
            <span className="text-xs text-amber-800 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Needs Review
            </span>
            <div className="text-2xl font-black font-mono text-amber-700">
              {contentHealth.needsReview.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-800/80 block">
              {contentHealth.needsReviewPercentage}% pending SME moderation
            </span>
          </div>

          {/* Rejected */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1">
            <span className="text-xs text-rose-800 font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" /> Rejected Outliers
            </span>
            <div className="text-2xl font-black font-mono text-rose-700">
              {contentHealth.rejected.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-800/80 block">
              {contentHealth.rejectedPercentage}% archived (out of syllabus)
            </span>
          </div>
        </div>

        {/* Proportional Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Corpus Distribution:</span>
            <span>{contentHealth.approvedPercentage}% Approved • {contentHealth.needsReviewPercentage}% Review • {contentHealth.rejectedPercentage}% Rejected</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${contentHealth.approvedPercentage}%` }}
              title="Approved"
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${contentHealth.needsReviewPercentage}%` }}
              title="Needs Review"
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${contentHealth.rejectedPercentage}%` }}
              title="Rejected"
            />
          </div>
        </div>
      </div>

      {/* 3. QUESTION QUALITY AUDIT DECK */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
              Automated Integrity Scanner
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Question Quality Diagnostics
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Heuristic OCR & Citation Checker
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {questionQuality.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                item.severity === "clean"
                  ? "bg-emerald-50/50 border-emerald-200"
                  : item.severity === "warning"
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">
                    {item.category}
                  </span>
                  <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                    item.severity === "clean"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.count > 20
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-200 text-slate-800"
                  }`}>
                    {item.count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition ${
                  item.severity === "clean"
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                {item.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TEST ANALYTICS & TELEMETRY */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Examination Telemetry
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              Live Mock Test Analytics
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {testAnalytics.activeTestTakers24h.toLocaleString()} Active Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Most Attempted Test */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Most Attempted Test
              </span>
              <BarChart3 className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                {testAnalytics.mostAttemptedTest.testName}
              </h4>
              <div className="text-2xl font-black font-mono text-sky-600 mt-1">
                {testAnalytics.mostAttemptedTest.attemptsCount.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-500">Attempts</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Average: <strong className="font-mono text-slate-900">{testAnalytics.mostAttemptedTest.avgScore} / 720</strong></span>
              <span>Median: <strong className="font-mono text-slate-900">{testAnalytics.mostAttemptedTest.medianScore}</strong></span>
            </div>
          </div>

          {/* Card 2: Hardest Question */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                Hardest Question
              </span>
              <Target className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                {testAnalytics.hardestQuestion.questionRef}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {testAnalytics.hardestQuestion.subject} • {testAnalytics.hardestQuestion.chapter}
              </p>
              <div className="text-2xl font-black font-mono text-rose-600 mt-1">
                {testAnalytics.hardestQuestion.accuracyPercent}%{" "}
                <span className="text-xs font-normal text-slate-500">Accuracy Rate</span>
              </div>
            </div>
            <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-xs text-slate-600">
              <span>Attempts: <strong className="font-mono text-slate-900">{testAnalytics.hardestQuestion.attemptsCount.toLocaleString()}</strong></span>
              <span className="text-rose-700 font-bold text-[11px]">Lowest in Bank</span>
            </div>
          </div>

          {/* Card 3: Most-Missed Question */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                Most-Missed Question
              </span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">
                {testAnalytics.mostMissedQuestion.questionRef}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {testAnalytics.mostMissedQuestion.subject} • {testAnalytics.mostMissedQuestion.chapter}
              </p>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {testAnalytics.mostMissedQuestion.incorrectPercent}%{" "}
                <span className="text-xs font-normal text-slate-500">Incorrect Attempts</span>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-200 text-[11px] text-slate-600">
              <span className="text-amber-800 font-semibold block truncate">
                Hotspot: {testAnalytics.mostMissedQuestion.primaryMistakeReason}
              </span>
            </div>
          </div>
        </div>

        {/* Global Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Average Score</span>
            <span className="font-black font-mono text-slate-900 text-base">{testAnalytics.averageScore} / {testAnalytics.maxScore}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Completion</span>
            <span className="font-black font-mono text-emerald-600 text-base">{testAnalytics.averageCompletionRate}%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Test Takers (24h)</span>
            <span className="font-black font-mono text-sky-600 text-base">{testAnalytics.activeTestTakers24h.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CBT Session Stability</span>
            <span className="font-black font-mono text-emerald-600 text-base">99.98%</span>
          </div>
        </div>
      </div>

      {/* 5. QUICK OPERATIONS NAV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/questions"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-400 transition space-y-3 group"
        >
          <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Question Bank Manager</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Filter, edit LaTeX formulas, update answer keys, and manage taxonomy.
          </p>
        </Link>

        <Link
          href="/admin/questions/create"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition space-y-3 group"
        >
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Manual Question Builder</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Real-time split-screen KaTeX preview, math formula toolbar, and chapter selector.
          </p>
        </Link>

        <Link
          href="/admin/pdfs"
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-3 group"
        >
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <FileUp className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">PDF Extraction Deck</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload question paper PDFs, parse chunks, and inspect OCR confidence.
          </p>
        </Link>
      </div>

    </div>
  );
}
