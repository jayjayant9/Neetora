"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, CheckCircle2, HelpCircle, Eye, RefreshCw } from "lucide-react";
import { NEET_ACADEMIC_TAXONOMY } from "@/lib/data/academic-taxonomy";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";

export default function CreateQuestionPage() {
  // Form State
  const [questionText, setQuestionText] = useState(
    "An electron moves with velocity $\\vec{v}$ in a uniform magnetic field $\\vec{B}$. The magnetic Lorentz force experienced by the electron is:"
  );
  const [optionA, setOptionA] = useState("$q(\\vec{v} \\cdot \\vec{B})$");
  const [optionB, setOptionB] = useState("$q(\\vec{v} \\times \\vec{B})$");
  const [optionC, setOptionC] = useState("$q\\vec{E}$");
  const [optionD, setOptionD] = useState("Zero always");
  const [correctOption, setCorrectOption] = useState<"A" | "B" | "C" | "D">("B");

  const [selectedSubjectId, setSelectedSubjectId] = useState("sub-phy");
  const [selectedChapterId, setSelectedChapterId] = useState("ch-phy-06");
  const [selectedTopicId, setSelectedTopicId] = useState("top-phy-06-2");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [source, setSource] = useState("NEET PYQ");
  const [sourceYear, setSourceYear] = useState<number>(2024);
  const [explanation, setExplanation] = useState(
    "The magnetic Lorentz force on a charged particle moving in a magnetic field is given by $\\vec{F}_m = q(\\vec{v} \\times \\vec{B})$. The direction is perpendicular to both $\\vec{v}$ and $\\vec{B}$ according to the right-hand rule."
  );
  const [status, setStatus] = useState<"draft" | "approved">("approved");
  const [isSaved, setIsSaved] = useState(false);

  // Cascading chapters and topics
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

  // Insert math snippet into text area helper
  const insertMathSnippet = (snippet: string) => {
    setQuestionText((prev) => prev + " " + snippet);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create New Question</h1>
          <p className="text-xs text-slate-500">
            Manual Question Builder with Real-time KaTeX STEM Preview
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Question Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            Save Question
          </button>
        </div>
      </div>

      {/* Split Screen Grid: Form (Left) vs Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Input Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

          {/* Academic Taxonomy Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const newSubId = e.target.value;
                  setSelectedSubjectId(newSubId);
                  const sub = NEET_ACADEMIC_TAXONOMY.find((s) => s.id === newSubId);
                  if (sub && sub.chapters.length > 0) {
                    setSelectedChapterId(sub.chapters[0].id);
                    setSelectedTopicId(sub.chapters[0].topics[0]?.id || "");
                  }
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                {NEET_ACADEMIC_TAXONOMY.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chapter *</label>
              <select
                value={selectedChapterId}
                onChange={(e) => {
                  const newChId = e.target.value;
                  setSelectedChapterId(newChId);
                  const ch = currentChapters.find((c) => c.id === newChId);
                  setSelectedTopicId(ch?.topics[0]?.id || "");
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white truncate"
              >
                {currentChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Class {ch.classLevel} - {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white truncate"
              >
                {currentTopics.map((top) => (
                  <option key={top.id} value={top.id}>
                    {top.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Source Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="NEET PYQ">NEET PYQ</option>
                <option value="AIIMS">AIIMS</option>
                <option value="NCERT Exemplar">NCERT Exemplar</option>
                <option value="Internal Mock">Internal Mock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                min="1995"
                max="2026"
                value={sourceYear}
                onChange={(e) => setSourceYear(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="approved">Approved (Live)</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Question Textarea with Math Symbol Helpers */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Question Text * <span className="font-normal text-slate-400">(Supports $...$ inline & $$...$$ block KaTeX)</span>
              </label>
            </div>

            {/* Math Symbols Bar */}
            <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 font-semibold px-1 self-center">Math Helper:</span>
              {[
                { label: "\\vec{F}", val: "$\\vec{F}$" },
                { label: "\\frac{a}{b}", val: "$\\frac{a}{b}$" },
                { label: "\\sqrt{x}", val: "$\\sqrt{x}$" },
                { label: "\\theta", val: "$\\theta$" },
                { label: "\\alpha", val: "$\\alpha$" },
                { label: "\\beta", val: "$\\beta$" },
                { label: "\\Delta", val: "$\\Delta$" },
                { label: "\\lambda", val: "$\\lambda$" },
                { label: "\\mu_0", val: "$\\mu_0$" },
                { label: "\\pi", val: "$\\pi$" },
                { label: "\\Omega", val: "$\\Omega$" },
              ].map((sym) => (
                <button
                  type="button"
                  key={sym.label}
                  onClick={() => insertMathSnippet(sym.val)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:border-sky-400 text-slate-700 rounded text-[11px] font-mono hover:text-sky-600 transition"
                >
                  {sym.label}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question text with LaTeX..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Options & Correct Answer Key * <span className="font-normal text-slate-400">(Click radio button to mark correct answer)</span>
            </label>

            {[
              { key: "A" as const, val: optionA, set: setOptionA },
              { key: "B" as const, val: optionB, set: setOptionB },
              { key: "C" as const, val: optionC, set: setOptionC },
              { key: "D" as const, val: optionD, set: setOptionD },
            ].map((opt) => (
              <div
                key={opt.key}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${correctOption === opt.key
                    ? "bg-emerald-50/60 border-emerald-500"
                    : "bg-slate-50 border-slate-200"
                  }`}
              >
                <label className="flex items-center cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="correctOptionRadio"
                    checked={correctOption === opt.key}
                    onChange={() => setCorrectOption(opt.key)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${correctOption === opt.key
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                      }`}
                  >
                    ({opt.key})
                  </span>
                </label>

                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => opt.set(e.target.value)}
                  placeholder={`Option ${opt.key} text or formula...`}
                  className="flex-1 text-xs font-mono p-2 rounded border border-slate-300 focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                />
              </div>
            ))}
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Detailed Solution / Explanation
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Step-by-step conceptual solution or NCERT reference..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </form>

        {/* RIGHT COLUMN: Live CBT Preview (Step 4.3) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-sky-600" />
              Live CBT Preview
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Real-time KaTeX
            </span>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden">
            {/* Preview Header */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                {currentSubject?.name || "Subject"} — Question Preview
              </span>
              <span className="font-mono text-emerald-400 font-bold">[+4, -1]</span>
            </div>

            {/* Question Body */}
            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-500 font-medium">
                {currentChapter?.name} • Class {currentChapter?.classLevel}
              </div>

              <div className="text-sm text-slate-900 font-medium leading-relaxed">
                <KaTeXRenderer content={questionText} />
              </div>

              {/* Options Preview */}
              <div className="space-y-2 pt-2">
                {[
                  { key: "A" as const, val: optionA },
                  { key: "B" as const, val: optionB },
                  { key: "C" as const, val: optionC },
                  { key: "D" as const, val: optionD },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`flex items-start p-3 rounded-lg border text-xs transition ${correctOption === opt.key
                        ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 font-semibold"
                        : "bg-slate-50/50 border-slate-200 text-slate-800"
                      }`}
                  >
                    <span className="font-bold mr-2">({opt.key})</span>
                    <div className="flex-1">
                      <KaTeXRenderer content={opt.val} />
                    </div>
                    {correctOption === opt.key && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded ml-2">
                        Key
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation Accordion Preview */}
              {explanation && (
                <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Explanation / Solution:
                  </div>
                  <div className="text-slate-600 leading-relaxed text-[11px]">
                    <KaTeXRenderer content={explanation} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
