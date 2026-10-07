import { NextResponse } from "next/server";
import { finalizeExamSubmission, getExamAttempt } from "@/lib/data/exam-attempts";
import { getMockExamQuestions } from "@/lib/data/mock-exam-questions";
import { validateAnswerPayload } from "@/lib/security/validation";
import { logAuditEvent } from "@/lib/security/audit-logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, reason = "manual", answers, idempotencyKey } = body;

    if (!attemptId) {
      return NextResponse.json({ success: false, error: "Missing attemptId parameter." }, { status: 400 });
    }

    // Input Validation Guard
    if (answers && !validateAnswerPayload(answers)) {
      return NextResponse.json({ success: false, error: "Malformed answers payload detected." }, { status: 400 });
    }

    // Check for attempt locking / idempotency
    const existing = getExamAttempt(attemptId);
    if (existing && existing.isSubmitted && existing.score !== undefined) {
      // Return locked result without re-evaluating
      logAuditEvent({
        eventType: "EXAM_LOCKED",
        severity: "info",
        details: `Idempotent submission received for already locked attempt ${attemptId}.`,
        metadata: { attemptId, idempotencyKey }
      });

      return NextResponse.json({
        success: true,
        attempt: existing,
        isIdempotent: true
      });
    }

    // Build correct answers lookup from question pool
    const questions = getMockExamQuestions();
    const correctMap: Record<number, "A" | "B" | "C" | "D"> = {};
    questions.forEach((q, idx) => {
      correctMap[idx] = q.correctOption;
    });

    const finalized = finalizeExamSubmission(
      attemptId,
      reason as "manual" | "timer_expired" | "browser_back",
      answers,
      correctMap
    );

    // Automatically catalogue mistakes into Mistake Book
    const { addMistakeToBook } = await import("@/lib/data/mistake-book");
    questions.forEach((q, idx) => {
      const ansRec = finalized.answers[idx];
      if (ansRec && ansRec.selectedOption && ansRec.selectedOption !== q.correctOption) {
        addMistakeToBook({
          id: `mst-${attemptId}-${q.id}`,
          questionId: q.id,
          questionIndex: idx + 1,
          subject: (q.subjectName === "Botany" || q.subjectName === "Zoology" ? "Biology" : q.subjectName) as "Physics" | "Chemistry" | "Biology",
          chapterName: q.chapterName,
          topicName: q.topicName,
          questionText: q.questionText,
          options: q.options,
          selectedOption: ansRec.selectedOption,
          correctOption: q.correctOption,
          explanation: q.explanation,
          sourceExamId: attemptId,
          sourceExamTitle: finalized.testTitle,
          timeSpentSeconds: ansRec.timeSpentSeconds,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Audit Logging
    logAuditEvent({
      eventType: "EXAM_SUBMITTED",
      severity: "info",
      details: `Exam attempt ${attemptId} finalized. Score: ${finalized.score}/720. Reason: ${reason}.`,
      metadata: { attemptId, reason, score: finalized.score, accuracy: finalized.accuracy }
    });

    return NextResponse.json({
      success: true,
      attempt: finalized,
    });
  } catch (error: any) {
    console.error("Failed to submit exam:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit exam" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { clearAllExamAttempts } = await import("@/lib/data/exam-attempts");
    clearAllExamAttempts();
    return NextResponse.json({
      success: true,
      message: "All exam attempts cleared successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear attempts" },
      { status: 500 }
    );
  }
}
