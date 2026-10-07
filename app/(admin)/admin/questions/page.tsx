"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  PlusCircle, 
  Filter, 
  Trash2, 
  Archive, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Sparkles,
  X
} from "lucide-react";
import { INITIAL_QUESTIONS, StoredQuestion } from "@/lib/data/sample-questions";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<StoredQuestion[]>(INITIAL_QUESTIONS);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Selected question for Quick Preview Modal
  const [previewQuestion, setPreviewQuestion] = useState<StoredQuestion | null>(null);

  // Filtered Questions Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search query (matches question text or explanation)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesExplanation = q.explanation?.toLowerCase().includes(query) || false;
        const matchesChapter = q.chapterName.toLowerCase().includes(query);
        if (!matchesText && !matchesExplanation && !matchesChapter) return false;
      }

      // Subject Filter
      if (subjectFilter !== "all" && q.subjectName.toLowerCase() !== subjectFilter.toLowerCase()) {
        return false;
      }

      // Class Filter
      if (classFilter !== "all" && q.classLevel !== Number(classFilter)) {
        return false;
      }

      // Difficulty Filter
      if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) {
        return false;
      }

      // Source Filter
      if (sourceFilter !== "all" && q.source !== sourceFilter) {
        return false;
      }

      // Year Filter
      if (yearFilter !== "all" && q.sourceYear !== Number(yearFilter)) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, subjectFilter, classFilter, difficultyFilter, sourceFilter, yearFilter]);

  // Actions
  const handleArchive = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "archived" } : q))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this draft question?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (previewQuestion?.id === id) setPreviewQuestion(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setClassFilter("all");
    setDifficultyFilter("all");
    setSourceFilter("all");
    setYearFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Question Bank Repository</h1>
          <p className="text-xs text-slate-500">
            Search, Multi-facet Filter Matrix, and Question Lifecycle Management
          </p>
        </div>

        <Link
          href="/admin/questions/create"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create Question
        </Link>
      </div>

      {/* SEARCH & MULTI-FACET FILTER MATRIX */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by formula, concept, chapter, or explanation..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50"
          />
        </div>

        {/* Facet Filters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Botany">Botany</option>
              <option value="Zoology">Zoology</option>
            </select>
          </div>

          {/* Class Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Class Level</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Sources</option>
              <option value="NEET PYQ">NEET PYQ</option>
              <option value="AIIMS">AIIMS</option>
              <option value="Internal Mock">Internal Mock</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Counter */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-bold">{filteredQuestions.length}</strong> of{" "}
            {questions.length} questions
          </span>
          <button
            onClick={resetFilters}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* QUESTION LISTINGS TABLE / CARDS */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
            <Filter className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No questions match your filter criteria</h3>
            <p className="text-xs text-slate-400">Try loosening your search keywords or resetting the filters.</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className={`bg-white p-5 rounded-xl border transition shadow-sm hover:shadow ${
                q.status === "archived" ? "opacity-60 bg-slate-50 border-slate-200" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                {/* Taxonomy & Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    {q.subjectName}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {q.chapterName} • Class {q.classLevel}
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${
                      q.difficulty === "easy"
                        ? "bg-emerald-100 text-emerald-800"
                        : q.difficulty === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {q.source} {q.sourceYear}
                  </span>
                  {q.status === "archived" && (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                      Archived
                    </span>
                  )}
                </div>

                {/* Action Buttons (Step 4.4) */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition"
                    title="Quick Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/admin/questions/create?edit=${q.id}`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
                    title="Edit Question"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleArchive(q.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition"
                    title="Archive (Soft Delete)"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                    title="Permanent Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text with KaTeX */}
              <div className="text-sm font-medium text-slate-900 leading-relaxed mb-3">
                <KaTeXRenderer content={q.questionText} />
              </div>

              {/* Compact Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      q.correctOption === opt.key
                        ? "bg-emerald-50/70 border-emerald-400 text-emerald-950 font-medium"
                        : "bg-slate-50/60 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-slate-500">({opt.key})</span>
                    <div className="flex-1">
                      <KaTeXRenderer content={opt.text} />
                    </div>
                    {q.correctOption === opt.key && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                        Key
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Question Preview: {previewQuestion.id}</h3>
                <p className="text-[11px] text-slate-400">
                  {previewQuestion.subjectName} • {previewQuestion.chapterName} ({previewQuestion.source} {previewQuestion.sourceYear})
                </p>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="text-base text-slate-900 font-medium leading-relaxed">
                <KaTeXRenderer content={previewQuestion.questionText} />
              </div>

              <div className="space-y-2">
                {previewQuestion.options.map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                      previewQuestion.correctOption === opt.key
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <span className="font-bold">({opt.key})</span>
                    <div className="flex-1">
                      <KaTeXRenderer content={opt.text} />
                    </div>
                    {previewQuestion.correctOption === opt.key && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {previewQuestion.explanation && (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Explanation / Solution
                  </div>
                  <div className="text-amber-950 leading-relaxed text-[11px]">
                    <KaTeXRenderer content={previewQuestion.explanation} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
