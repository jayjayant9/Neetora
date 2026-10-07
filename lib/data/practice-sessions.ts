export interface QuestionAttempt {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D";
  correctAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  timeSpentSeconds: number;
  attemptNumber: number;
  subjectName?: string;
  chapterName?: string;
  timestamp: string;
}

export interface PracticeSession {
  id: string;
  testId?: string;
  testTitle: string;
  attempts: QuestionAttempt[];
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  accuracyPercentage: number;
  totalTimeSeconds: number;
  completedAt: string;
}

// Global runtime cache for practice session analytics
declare global {
  var __NEETORA_PRACTICE_SESSIONS__: PracticeSession[] | undefined;
}

if (!globalThis.__NEETORA_PRACTICE_SESSIONS__) {
  globalThis.__NEETORA_PRACTICE_SESSIONS__ = [];
}

export function savePracticeSession(session: PracticeSession): PracticeSession {
  if (!globalThis.__NEETORA_PRACTICE_SESSIONS__) {
    globalThis.__NEETORA_PRACTICE_SESSIONS__ = [];
  }
  globalThis.__NEETORA_PRACTICE_SESSIONS__.unshift(session);
  return session;
}

export function getPracticeSessions(): PracticeSession[] {
  return globalThis.__NEETORA_PRACTICE_SESSIONS__ || [];
}

export function getPracticeSessionById(id: string): PracticeSession | undefined {
  return (globalThis.__NEETORA_PRACTICE_SESSIONS__ || []).find((s) => s.id === id);
}
