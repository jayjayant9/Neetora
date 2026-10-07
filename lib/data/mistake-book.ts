import { StoredQuestion } from "./sample-questions";

export type MistakeReason =
  | "didnt_know_concept"
  | "silly_mistake"
  | "misread_question"
  | "calculation_mistake"
  | "guessed"
  | "forgot_fact"
  | "time_pressure";

export interface MistakeReasonConfig {
  key: MistakeReason;
  label: string;
  icon: string;
  badgeClass: string;
  description: string;
}

export const MISTAKE_REASONS: MistakeReasonConfig[] = [
  {
    key: "didnt_know_concept",
    label: "Didn't know concept",
    icon: "🧠",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Theoretical gap or unstudied NCERT topic",
  },
  {
    key: "silly_mistake",
    label: "Silly mistake",
    icon: "🤦",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Marked wrong option despite knowing the right answer",
  },
  {
    key: "misread_question",
    label: "Misread question",
    icon: "👀",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Missed 'INCORRECT' / 'NOT' or unit notation in question statement",
  },
  {
    key: "calculation_mistake",
    label: "Calculation mistake",
    icon: "🔢",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    description: "Mathematical error in numerical solving or decimal placement",
  },
  {
    key: "guessed",
    label: "Guessed",
    icon: "🎲",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
    description: "Intuitive guess without 100% conceptual certainty",
  },
  {
    key: "forgot_fact",
    label: "Forgot fact",
    icon: "📖",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Memory recall slip in formula, exception, or NCERT fact",
  },
  {
    key: "time_pressure",
    label: "Time pressure",
    icon: "⏱",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    description: "Rushed through the question due to ticking clock",
  },
];

export interface MistakeEntry {
  id: string;
  questionId: string;
  questionIndex: number;
  subject: "Physics" | "Chemistry" | "Biology";
  chapterName: string;
  topicName?: string;
  questionText: string;
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  selectedOption: "A" | "B" | "C" | "D";
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
  reason?: MistakeReason;
  timeSpentSeconds?: number;
  sourceExamId: string;
  sourceExamTitle: string;
  timestamp: string;
  isResolved?: boolean;
}

// Global runtime cache for mistake book across Next.js dev bundles
declare global {
  var __NEETORA_MISTAKE_BOOK__: MistakeEntry[] | undefined;
}

if (!globalThis.__NEETORA_MISTAKE_BOOK__) {
  // Starts empty and populates dynamically from real candidate exam attempts
  globalThis.__NEETORA_MISTAKE_BOOK__ = [];
}

export function getMistakeBook(): MistakeEntry[] {
  return globalThis.__NEETORA_MISTAKE_BOOK__ || [];
}

export function addMistakeToBook(entry: MistakeEntry): MistakeEntry {
  if (!globalThis.__NEETORA_MISTAKE_BOOK__) {
    globalThis.__NEETORA_MISTAKE_BOOK__ = [];
  }
  // Prevent duplicate additions of same question from same exam
  const existingIdx = globalThis.__NEETORA_MISTAKE_BOOK__.findIndex(
    (m) => m.questionId === entry.questionId && m.sourceExamId === entry.sourceExamId
  );
  if (existingIdx >= 0) {
    globalThis.__NEETORA_MISTAKE_BOOK__[existingIdx] = entry;
    return entry;
  }
  globalThis.__NEETORA_MISTAKE_BOOK__.unshift(entry);
  return entry;
}

export function updateMistakeReason(mistakeId: string, reason: MistakeReason): boolean {
  if (!globalThis.__NEETORA_MISTAKE_BOOK__) return false;
  const target = globalThis.__NEETORA_MISTAKE_BOOK__.find((m) => m.id === mistakeId);
  if (target) {
    target.reason = reason;
    return true;
  }
  return false;
}

export function markMistakeResolved(mistakeId: string, isResolved = true): boolean {
  if (!globalThis.__NEETORA_MISTAKE_BOOK__) return false;
  const target = globalThis.__NEETORA_MISTAKE_BOOK__.find((m) => m.id === mistakeId);
  if (target) {
    target.isResolved = isResolved;
    return true;
  }
  return false;
}

export function clearMistakes(): void {
  globalThis.__NEETORA_MISTAKE_BOOK__ = [];
}
