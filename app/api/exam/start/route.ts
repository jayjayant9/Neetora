import { NextResponse } from "next/server";
import { createExamAttempt } from "@/lib/data/exam-attempts";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const testId = body.testId || "test-mock-full-180";
    const testTitle = body.testTitle || "All-India NEET Full Syllabus Mock Exam (180 Questions)";
    const totalQuestions = body.totalQuestions || 180;
    const durationMinutes = body.durationMinutes || 195;

    const attempt = createExamAttempt(testId, testTitle, totalQuestions, durationMinutes);

    return NextResponse.json({
      success: true,
      attemptId: attempt.attemptId,
      attempt_started_at: attempt.attempt_started_at,
      attempt_expires_at: attempt.attempt_expires_at,
      durationMinutes: attempt.durationMinutes,
      totalQuestions: attempt.totalQuestions,
      currentQuestionIndex: attempt.currentQuestionIndex,
      answers: attempt.answers,
    });
  } catch (error: any) {
    console.error("Failed to start exam session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to start exam" },
      { status: 500 }
    );
  }
}
