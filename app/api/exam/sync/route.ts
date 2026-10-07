import { NextResponse } from "next/server";
import { updateExamAnswers, getExamAttempt } from "@/lib/data/exam-attempts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, answers, currentQuestionIndex } = body;

    if (!attemptId) {
      return NextResponse.json({ success: false, error: "Missing attemptId" }, { status: 400 });
    }

    const existing = getExamAttempt(attemptId);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Session expired or invalid" }, { status: 404 });
    }

    if (existing.isSubmitted) {
      return NextResponse.json({
        success: true,
        isSubmitted: true,
        hasExpired: existing.submissionReason === "timer_expired",
      });
    }

    const { attempt, hasExpired } = updateExamAnswers(
      attemptId,
      answers || {},
      typeof currentQuestionIndex === "number" ? currentQuestionIndex : existing.currentQuestionIndex
    );

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.floor((new Date(attempt.attempt_expires_at).getTime() - now) / 1000));

    return NextResponse.json({
      success: true,
      hasExpired,
      isSubmitted: attempt.isSubmitted,
      remainingSeconds,
      attempt_expires_at: attempt.attempt_expires_at,
    });
  } catch (error: any) {
    console.error("Failed to sync exam session:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync" },
      { status: 500 }
    );
  }
}
