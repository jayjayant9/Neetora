// Server-Authoritative Exam Attempt Telemetry & Storage

export type QuestionStatus = 
  | "answered" 
  | "not_answered" 
  | "marked_for_review" 
  | "answered_and_marked" 
  | "not_visited";

export interface ExamAnswerRecord {
  selectedOption: "A" | "B" | "C" | "D" | null;
  status: QuestionStatus;
  timeSpentSeconds: number;
  lastUpdated: string;
}

export interface SubjectScore {
  subjectName: string;
  totalQuestions: number;
  maxMarks: number;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
}

export interface ExamAttempt {
  attemptId: string;
  testId: string;
  testTitle: string;
  totalQuestions: number;
  durationMinutes: number;
  attempt_started_at: string;
  attempt_expires_at: string;
  isSubmitted: boolean;
  submittedAt?: string;
  submissionReason?: "manual" | "timer_expired" | "browser_back";
  answers: Record<number, ExamAnswerRecord>;
  currentQuestionIndex: number;
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  accuracy?: number;
  totalTimeSpentSeconds?: number;
  avgTimePerQuestionSeconds?: number;
  subjectScores?: {
    physics: SubjectScore;
    chemistry: SubjectScore;
    biology: SubjectScore;
  };
}

// In-memory persistent server storage for exam attempts
declare global {
  // eslint-disable-next-line no-var
  var __neetora_exam_attempts: Map<string, ExamAttempt> | undefined;
}

if (!globalThis.__neetora_exam_attempts) {
  globalThis.__neetora_exam_attempts = new Map<string, ExamAttempt>();
}

const attemptsStore = globalThis.__neetora_exam_attempts;

/**
 * Creates or resets an authoritative exam attempt session.
 * 180 Minutes (10,800 seconds).
 */
export function createExamAttempt(
  testId: string = "test-mock-01",
  testTitle: string = "NEET Full Mock #01",
  totalQuestions: number = 180,
  durationMinutes: number = 180
): ExamAttempt {
  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const initialAnswers: Record<number, ExamAnswerRecord> = {};
  for (let i = 0; i < totalQuestions; i++) {
    initialAnswers[i] = {
      selectedOption: null,
      status: "not_visited",
      timeSpentSeconds: 0,
      lastUpdated: now.toISOString(),
    };
  }

  // Mark first question as not_answered (visited)
  if (initialAnswers[0]) {
    initialAnswers[0].status = "not_answered";
  }

  const attempt: ExamAttempt = {
    attemptId,
    testId,
    testTitle,
    totalQuestions,
    durationMinutes,
    attempt_started_at: now.toISOString(),
    attempt_expires_at: expiresAt.toISOString(),
    isSubmitted: false,
    answers: initialAnswers,
    currentQuestionIndex: 0,
  };

  attemptsStore.set(attemptId, attempt);
  return attempt;
}

export function getExamAttempt(attemptId: string): ExamAttempt | null {
  return attemptsStore.get(attemptId) || null;
}

export function getLatestSubmittedAttempt(): ExamAttempt | null {
  const attempts = Array.from(attemptsStore.values()).filter((a) => a.isSubmitted && a.score !== undefined);
  if (attempts.length === 0) return null;
  attempts.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
  return attempts[0];
}

export function getAllSubmittedAttempts(): ExamAttempt[] {
  return Array.from(attemptsStore.values()).filter((a) => a.isSubmitted && a.score !== undefined);
}

export function clearAllExamAttempts(): void {
  attemptsStore.clear();
}

export function updateExamAnswers(
  attemptId: string,
  answers: Record<number, ExamAnswerRecord>,
  currentQuestionIndex: number
): { attempt: ExamAttempt; hasExpired: boolean } {
  const attempt = attemptsStore.get(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found");
  }

  const now = Date.now();
  const expireTime = new Date(attempt.attempt_expires_at).getTime();
  const hasExpired = now >= expireTime;

  if (hasExpired && !attempt.isSubmitted) {
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date().toISOString();
    attempt.submissionReason = "timer_expired";
  }

  // Attempt locking: do not mutate answers if session was already finalized
  if (attempt.isSubmitted) {
    return { attempt, hasExpired: true };
  }

  attempt.answers = { ...attempt.answers, ...answers };
  attempt.currentQuestionIndex = currentQuestionIndex;
  attemptsStore.set(attemptId, attempt);

  return { attempt, hasExpired };
}

export function finalizeExamSubmission(
  attemptId: string,
  reason: "manual" | "timer_expired" | "browser_back",
  clientAnswers?: Record<number, ExamAnswerRecord>,
  correctAnswersMap?: Record<number, "A" | "B" | "C" | "D">
): ExamAttempt {
  let attempt = attemptsStore.get(attemptId);
  
  // Submission Idempotency: If attempt is already submitted and scored, return locked result safely
  if (attempt && attempt.isSubmitted && attempt.score !== undefined) {
    return attempt;
  }

  // If attempt was not found in server cache, create a fallback record so submission succeeds gracefully
  if (!attempt) {
    attempt = {
      attemptId,
      testId: "test-mock-full-180",
      testTitle: "All-India NEET Full Syllabus Mock Exam (180 Questions)",
      totalQuestions: 180,
      durationMinutes: 195,
      attempt_started_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      attempt_expires_at: new Date().toISOString(),
      isSubmitted: true,
      submittedAt: new Date().toISOString(),
      submissionReason: reason,
      answers: clientAnswers || {},
      currentQuestionIndex: 0,
    };
  } else {
    if (clientAnswers) {
      attempt.answers = { ...attempt.answers, ...clientAnswers };
    }
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date().toISOString();
    attempt.submissionReason = reason;
  }

  // Calculate score if answers map provided
  if (correctAnswersMap) {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    // Subject tracking: Physics (0-44), Chemistry (45-89), Biology (90-179)
    let phyCorrect = 0, phyIncorrect = 0, phyUnattempted = 0;
    let chemCorrect = 0, chemIncorrect = 0, chemUnattempted = 0;
    let bioCorrect = 0, bioIncorrect = 0, bioUnattempted = 0;

    for (let i = 0; i < attempt.totalQuestions; i++) {
      const rec = attempt.answers[i];
      const correctOpt = correctAnswersMap[i];

      const isSkipped = !rec || !rec.selectedOption;
      const isCorrect = !isSkipped && rec.selectedOption === correctOpt;
      const isIncorrect = !isSkipped && rec.selectedOption !== correctOpt;

      if (isSkipped) {
        unattempted++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      if (i < 45) {
        if (isSkipped) phyUnattempted++;
        else if (isCorrect) phyCorrect++;
        else phyIncorrect++;
      } else if (i < 90) {
        if (isSkipped) chemUnattempted++;
        else if (isCorrect) chemCorrect++;
        else chemIncorrect++;
      } else {
        if (isSkipped) bioUnattempted++;
        else if (isCorrect) bioCorrect++;
        else bioIncorrect++;
      }
    }

    const score = (correct * 4) - (incorrect * 1);
    const attemptedCount = correct + incorrect;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;

    const phyScore = (phyCorrect * 4) - (phyIncorrect * 1);
    const phyAttempted = phyCorrect + phyIncorrect;
    const phyAccuracy = phyAttempted > 0 ? Math.round((phyCorrect / phyAttempted) * 100) : 0;

    const chemScore = (chemCorrect * 4) - (chemIncorrect * 1);
    const chemAttempted = chemCorrect + chemIncorrect;
    const chemAccuracy = chemAttempted > 0 ? Math.round((chemCorrect / chemAttempted) * 100) : 0;

    const bioScore = (bioCorrect * 4) - (bioIncorrect * 1);
    const bioAttempted = bioCorrect + bioIncorrect;
    const bioAccuracy = bioAttempted > 0 ? Math.round((bioCorrect / bioAttempted) * 100) : 0;

    // Time calculations
    const maxDurationSecs = attempt.durationMinutes * 60;
    const elapsedSecs = Math.max(
      0,
      Math.floor((new Date(attempt.submittedAt || new Date().toISOString()).getTime() - new Date(attempt.attempt_started_at).getTime()) / 1000)
    );
    const totalTimeSpentSeconds = Math.min(elapsedSecs, maxDurationSecs);
    const avgTimePerQuestionSeconds = attemptedCount > 0 ? Math.round(totalTimeSpentSeconds / attemptedCount) : 0;

    attempt.score = score;
    attempt.correctCount = correct;
    attempt.incorrectCount = incorrect;
    attempt.unattemptedCount = unattempted;
    attempt.accuracy = accuracy;
    attempt.totalTimeSpentSeconds = totalTimeSpentSeconds;
    attempt.avgTimePerQuestionSeconds = avgTimePerQuestionSeconds;
    attempt.subjectScores = {
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
    };
  }

  attemptsStore.set(attemptId, attempt);
  return attempt;
}
