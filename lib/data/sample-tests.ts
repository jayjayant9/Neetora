import { FULL_EXAM_180_QUESTIONS } from "./exam-questions";

export type TestType = "Practice" | "Exam" | "PYQ" | "Custom";
export type TestStatus = "Draft" | "Review" | "Published" | "Live";

export interface TestConfiguration {
  durationMinutes: number;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowReview: boolean;
  allowBackNavigation: boolean;
}

export interface StoredTest {
  id: string;
  name: string;
  description: string;
  type: TestType;
  questionIds: string[];
  config: TestConfiguration;
  status: TestStatus;
  subjectDistribution?: {
    physics: number;
    chemistry: number;
    biology: number;
  };
  createdAt: string;
  updatedAt: string;
}

const allExamQuestionIds = FULL_EXAM_180_QUESTIONS.map((q) => q.id);

// Only the uploaded 180 questions full test
export const INITIAL_TESTS: StoredTest[] = [
  {
    id: "test-mock-full-180",
    name: "All-India NEET Full Syllabus Mock Exam (180 Questions)",
    description: "Complete full-length NEET examination containing 180 authentic questions: Physics (45), Chemistry (45), Botany (45), and Zoology (45). Maximum marks: 720.",
    type: "Exam",
    questionIds: allExamQuestionIds,
    config: {
      durationMinutes: 195,
      totalQuestions: 180,
      marksPerQuestion: 4,
      negativeMarks: -1,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      allowBackNavigation: true,
    },
    status: "Live",
    subjectDistribution: {
      physics: 45,
      chemistry: 45,
      biology: 90,
    },
    createdAt: "2026-06-15T00:00:00Z",
    updatedAt: "2026-10-06T00:00:00Z",
  }
];

// Persistent global singleton across Next.js dev server reloads
declare global {
  var __NEETORA_TESTS__: StoredTest[] | undefined;
}

globalThis.__NEETORA_TESTS__ = [...INITIAL_TESTS];

export function getStoredTests(): StoredTest[] {
  return globalThis.__NEETORA_TESTS__ || INITIAL_TESTS;
}

export function getTestById(id: string): StoredTest | undefined {
  return (globalThis.__NEETORA_TESTS__ || INITIAL_TESTS).find((t) => t.id === id);
}

export function saveTest(test: Omit<StoredTest, "id" | "createdAt" | "updatedAt">): StoredTest {
  const newTest: StoredTest = {
    ...test,
    id: `test-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!globalThis.__NEETORA_TESTS__) {
    globalThis.__NEETORA_TESTS__ = [...INITIAL_TESTS];
  }
  globalThis.__NEETORA_TESTS__.unshift(newTest);
  return newTest;
}

export function updateTestStatus(id: string, status: TestStatus): StoredTest | null {
  if (!globalThis.__NEETORA_TESTS__) {
    globalThis.__NEETORA_TESTS__ = [...INITIAL_TESTS];
  }
  const index = globalThis.__NEETORA_TESTS__.findIndex((t) => t.id === id);
  if (index === -1) return null;
  globalThis.__NEETORA_TESTS__[index] = {
    ...globalThis.__NEETORA_TESTS__[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  return globalThis.__NEETORA_TESTS__[index];
}

export function deleteTest(id: string): boolean {
  if (!globalThis.__NEETORA_TESTS__) {
    globalThis.__NEETORA_TESTS__ = [...INITIAL_TESTS];
  }
  const initLen = globalThis.__NEETORA_TESTS__.length;
  globalThis.__NEETORA_TESTS__ = globalThis.__NEETORA_TESTS__.filter((t) => t.id !== id);
  return globalThis.__NEETORA_TESTS__.length < initLen;
}
