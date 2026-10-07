"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  FileText, 
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon
} from "lucide-react";
import { INITIAL_EXTRACTED_STAGING } from "@/lib/extraction/sample-staging";
import { ExtractedQuestionStaging } from "@/lib/extraction/types";
import { KaTeXRenderer } from "@/components/question/KaTeXRenderer";
import { NEET_ACADEMIC_TAXONOMY } from "@/lib/data/academic-taxonomy";

export default function ExtractionReviewDeckPage() {
  const [stagingQuestions, setStagingQuestions] = useState<ExtractedQuestionStaging[]>(INITIAL_EXTRACTED_STAGING);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Active question
  const currentQ = stagingQuestions[currentIndex] || stagingQuestions[0];

  // Editable buffer
  const [editedText, setEditedText] = useState(currentQ?.questionText || "");
  const [editedOptionA, setEditedOptionA] = useState(currentQ?.options[0]?.text || "");
  const [editedOptionB, setEditedOptionB] = useState(currentQ?.options[1]?.text || "");
  const [editedOptionC, setEditedOptionC] = useState(currentQ?.options[2]?.text || "");
  const [editedOptionD, setEditedOptionD] = useState(currentQ?.options[3]?.text || "");
  const [editedCorrectKey, setEditedCorrectKey] = useState<"A" | "B" | "C" | "D">(currentQ?.correctOption || "A");
  const [editedExplanation, setEditedExplanation] = useState(currentQ?.explanation || "");

  // Update edit buffer when question changes
  const switchQuestion = (idx: number) => {
    if (idx >= 0 && idx < stagingQuestions.length) {
      setCurrentIndex(idx);
      setIsEditing(false);
      const nextQ = stagingQuestions[idx];
      setEditedText(nextQ.questionText);
      setEditedOptionA(nextQ.options[0]?.text || "");
      setEditedOptionB(nextQ.options[1]?.text || "");
      setEditedOptionC(nextQ.options[2]?.text || "");
      setEditedOptionD(nextQ.options[3]?.text || "");
      setEditedCorrectKey(nextQ.correctOption || "A");
      setEditedExplanation(nextQ.explanation || "");
    }
  };

  // Admin Actions (Step 5.6)
  const handleApprove = () => {
    setStagingQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex
          ? {
              ...q,
              reviewStatus: "approved",
              questionText: isEditing ? editedText : q.questionText,
              options: isEditing
                ? [
                    { key: "A", text: editedOptionA },
                    { key: "B", text: editedOptionB },
                    { key: "C", text: editedOptionC },
                    { key: "D", text: editedOptionD },
                  ]
                : q.options,
              correctOption: isEditing ? editedCorrectKey : q.correctOption,
              explanation: isEditing ? editedExplanation : q.explanation,
            }
          : q
      )
    );
    setIsEditing(false);
    // Advance to next unapproved question
    if (currentIndex < stagingQuestions.length - 1) {
      switchQuestion(currentIndex + 1);
    }
  };

  const handleReject = () => {
    const reason = prompt("Enter rejection reason (e.g. Duplicate question, Corrupted diagram, Out of syllabus):", "Low OCR readability");
    if (reason !== null) {
      setStagingQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIndex
            ? { ...q, reviewStatus: "rejected", rejectionReason: reason }
            : q
        )
      );
      if (currentIndex < stagingQuestions.length - 1) {
        switchQuestion(currentIndex + 1);
      }
    }
  };

  const pendingCount = stagingQuestions.filter((q) => q.reviewStatus === "pending").length;
  const approvedCount = stagingQuestions.filter((q) => q.reviewStatus === "approved").length;
  const rejectedCount = stagingQuestions.filter((q) => q.reviewStatus === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Extraction Review & Staging Deck
          </h1>
          <p className="text-xs text-slate-500">
            Side-by-Side Verification, Confidence Scores, and Approval into Question Bank
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            {pendingCount} Pending Review
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            {approvedCount} Approved
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
            {rejectedCount} Rejected
          </span>
        </div>
      </div>

      {/* QUESTION NAVIGATOR TABS */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2">Questions:</span>
          {stagingQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => switchQuestion(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                currentIndex === idx
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-sky-500"
                  : q.reviewStatus === "approved"
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : q.reviewStatus === "rejected"
                  ? "bg-rose-100 text-rose-800 line-through"
                  : q.confidence.overall < 90
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Q.{q.questionNumber}
              {q.reviewStatus === "approved" && <Check className="w-3 h-3 text-emerald-600" />}
              {q.confidence.overall < 90 && q.reviewStatus === "pending" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {currentIndex + 1} of {stagingQuestions.length}
          </span>
          <button
            onClick={() => switchQuestion(currentIndex + 1)}
            disabled={currentIndex === stagingQuestions.length - 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SPLIT SCREEN: LEFT (ORIGINAL PDF) vs RIGHT (EXTRACTED STAGING) (Step 5.4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: ORIGINAL PDF VIEW */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" />
              Original PDF Document: Page {currentQ.originalPageNumber}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">NEET_UG_2024.pdf</span>
          </div>

          {/* Simulated PDF Paper Canvas */}
          <div className="flex-1 bg-slate-200/70 p-4 overflow-y-auto flex items-center justify-center">
            <div className="bg-white rounded shadow-lg border border-slate-300 p-6 w-full max-w-sm space-y-4 font-serif text-slate-900 text-xs">
              <div className="border-b pb-2 flex justify-between text-[10px] text-slate-400 uppercase font-sans">
                <span>NEET (UG) — 2024</span>
                <span>Code Q4 • Page {currentQ.originalPageNumber}</span>
              </div>

              {/* Highlighted Bounding Box Area for the current question */}
              <div className="p-3 bg-amber-50/80 border-2 border-amber-400 rounded-md shadow-sm space-y-2 relative">
                <span className="absolute -top-2.5 left-2 bg-amber-500 text-slate-950 font-sans font-bold text-[9px] px-1.5 py-0.2 rounded shadow">
                  Target Bounding Box
                </span>
                
                <p className="font-bold text-slate-900 leading-relaxed font-sans text-[11px]">
                  {currentQ.rawSnippetText.split("\n")[0]}
                </p>

                <div className="space-y-1 font-sans text-[11px] text-slate-700 pl-1">
                  {currentQ.rawSnippetText.split("\n").slice(1).map((line, lIdx) => (
                    <div key={lIdx}>{line}</div>
                  ))}
                </div>

                {currentQ.hasDiagram && currentQ.diagramUrl && (
                  <div className="pt-2">
                    <img
                      src={currentQ.diagramUrl}
                      alt="Extracted question diagram"
                      className="max-h-36 rounded border border-slate-300 mx-auto object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-300 font-mono space-y-1">
                <p>91. Identify the incorrect pair regarding human anatomy...</p>
                <p>92. In a series LCR circuit, resonance condition is reached when...</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXTRACTED STAGING & CONFIDENCE (Step 5.4 & 5.5) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
          
          {/* Header & Confidence Bar (Step 5.5) */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Extracted Staging: Question {currentQ.questionNumber}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({currentQ.subjectName} • {currentQ.chapterName})
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  currentQ.reviewStatus === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : currentQ.reviewStatus === "rejected"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {currentQ.reviewStatus.toUpperCase()}
              </span>
            </div>

            {/* COMPONENT-LEVEL CONFIDENCE SCORES (Step 5.5) */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Question</span>
                <span className="font-mono font-bold text-emerald-600">{currentQ.confidence.questionText}%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Options</span>
                <span className={`font-mono font-bold ${currentQ.confidence.options < 90 ? "text-amber-600" : "text-emerald-600"}`}>
                  {currentQ.confidence.options}%
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Answer Key</span>
                <span className="font-mono font-bold text-emerald-600">{currentQ.confidence.answerKey}%</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">Overall Score</span>
                <span className={`font-mono font-bold ${currentQ.confidence.overall < 90 ? "text-amber-600" : "text-sky-600"}`}>
                  {currentQ.confidence.overall}%
                </span>
              </div>
            </div>

            {/* Validation Warnings */}
            {currentQ.validationWarnings.length > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>⚠️ Needs Review:</strong> {currentQ.validationWarnings.join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Staging Body: View or Edit Mode */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {isEditing ? (
              /* Inline Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                  <textarea
                    rows={3}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Options & Correct Key</label>
                  {[
                    { key: "A" as const, val: editedOptionA, set: setEditedOptionA },
                    { key: "B" as const, val: editedOptionB, set: setEditedOptionB },
                    { key: "C" as const, val: editedOptionC, set: setEditedOptionC },
                    { key: "D" as const, val: editedOptionD, set: setEditedOptionD },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editKeyRadio"
                        checked={editedCorrectKey === opt.key}
                        onChange={() => setEditedCorrectKey(opt.key)}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-xs font-bold text-slate-500">({opt.key})</span>
                      <input
                        type="text"
                        value={opt.val}
                        onChange={(e) => opt.set(e.target.value)}
                        className="flex-1 text-xs font-mono p-2 border rounded"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explanation</label>
                  <textarea
                    rows={2}
                    value={editedExplanation}
                    onChange={(e) => setEditedExplanation(e.target.value)}
                    className="w-full text-xs font-mono p-2 border rounded"
                  />
                </div>
              </div>
            ) : (
              /* Formatted KaTeX View Mode */
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-900 leading-relaxed">
                  <KaTeXRenderer content={currentQ.questionText} />
                </div>

                {/* Cropped Diagram Preview if exists */}
                {currentQ.hasDiagram && currentQ.diagramUrl && (
                  <div className="p-3 bg-slate-50 border rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                      Extracted Diagram Crop (94% Resolution)
                    </span>
                    <img
                      src={currentQ.diagramUrl}
                      alt="Cropped diagram"
                      className="max-h-40 rounded border border-slate-200 object-cover"
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2">
                  {currentQ.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                        currentQ.correctOption === opt.key
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold"
                          : "bg-slate-50/50 border-slate-200 text-slate-800"
                      }`}
                    >
                      <span className="font-bold text-slate-600">({opt.key})</span>
                      <div className="flex-1">
                        <KaTeXRenderer content={opt.text} />
                      </div>
                      {currentQ.correctOption === opt.key && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                          Answer Key
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Solution Explanation */}
                {currentQ.explanation && (
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Solution & NCERT Notes:
                    </span>
                    <div className="text-amber-950 text-[11px] leading-relaxed">
                      <KaTeXRenderer content={currentQ.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM ACTIONS BAR (Step 5.6) */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? "Cancel Edit" : "Edit Fields"}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReject}
                className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <X className="w-4 h-4" />
                Reject & Discard
              </button>

              <button
                onClick={handleApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                Approve & Insert into Bank
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
