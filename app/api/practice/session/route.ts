import { NextResponse } from "next/server";
import { savePracticeSession, getPracticeSessions, PracticeSession } from "@/lib/data/practice-sessions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { testId, testTitle, attempts } = body;

    if (!attempts || !Array.isArray(attempts)) {
      return NextResponse.json({ error: "Attempts array is required" }, { status: 400 });
    }

    const correctCount = attempts.filter((a: any) => a.isCorrect).length;
    const incorrectCount = attempts.filter((a: any) => !a.isCorrect).length;
    const attemptedCount = attempts.length;
    const totalQuestionsCount = Number(body.totalQuestions) || attemptedCount;
    const skippedCount = Math.max(0, totalQuestionsCount - attemptedCount);
    const accuracyPercentage = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const totalTimeSeconds = attempts.reduce((acc: number, cur: any) => acc + (cur.timeSpentSeconds || 0), 0);

    const session: PracticeSession = {
      id: `prac-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      testId: testId || "quick-drill",
      testTitle: testTitle || "High-Yield NEET Drill",
      attempts,
      totalQuestions: totalQuestionsCount,
      attemptedCount,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracyPercentage,
      totalTimeSeconds,
      completedAt: new Date().toISOString(),
    };

    savePracticeSession(session);

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save session" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = getPracticeSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve sessions" }, { status: 500 });
  }
}
