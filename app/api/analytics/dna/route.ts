import { NextResponse } from "next/server";
import { generateAttemptDna } from "@/lib/data/attempt-dna";
import { getLatestSubmittedAttempt } from "@/lib/data/exam-attempts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      score = 0,
      accuracy = 0,
      totalTimeSpentSeconds = 0,
      avgTimePerQuestionSeconds = 0,
      subjectScores = {
        physics: { score: 0, accuracy: 0, incorrectCount: 0 },
        chemistry: { score: 0, accuracy: 0, incorrectCount: 0 },
        biology: { score: 0, accuracy: 0, incorrectCount: 0 },
      },
      examTitle = "All-India NEET Full Syllabus Mock Exam (180 Questions)",
    } = body;

    const dna = generateAttemptDna({
      score,
      accuracy,
      totalTimeSpentSeconds,
      avgTimePerQuestionSeconds,
      subjectScores,
      examTitle,
    });

    return NextResponse.json({
      success: true,
      dna,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate Attempt DNA" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const latest = getLatestSubmittedAttempt();
    if (latest && latest.score !== undefined) {
      const dna = generateAttemptDna({
        score: latest.score,
        accuracy: latest.accuracy || 0,
        totalTimeSpentSeconds: latest.totalTimeSpentSeconds || 0,
        avgTimePerQuestionSeconds: latest.avgTimePerQuestionSeconds || 0,
        subjectScores: {
          physics: {
            score: latest.subjectScores?.physics.score || 0,
            accuracy: latest.subjectScores?.physics.accuracy || 0,
            incorrectCount: latest.subjectScores?.physics.incorrectCount || 0,
          },
          chemistry: {
            score: latest.subjectScores?.chemistry.score || 0,
            accuracy: latest.subjectScores?.chemistry.accuracy || 0,
            incorrectCount: latest.subjectScores?.chemistry.incorrectCount || 0,
          },
          biology: {
            score: latest.subjectScores?.biology.score || 0,
            accuracy: latest.subjectScores?.biology.accuracy || 0,
            incorrectCount: latest.subjectScores?.biology.incorrectCount || 0,
          },
        },
        examTitle: latest.testTitle || "All-India NEET Full Syllabus Mock Exam (180 Questions)",
      });

      return NextResponse.json({
        success: true,
        dna,
        hasAttempt: true,
        attemptId: latest.attemptId,
      });
    }

    // Default when no attempt has been completed yet
    const dna = generateAttemptDna({
      score: 0,
      accuracy: 0,
      totalTimeSpentSeconds: 0,
      avgTimePerQuestionSeconds: 0,
      subjectScores: {
        physics: { score: 0, accuracy: 0, incorrectCount: 0 },
        chemistry: { score: 0, accuracy: 0, incorrectCount: 0 },
        biology: { score: 0, accuracy: 0, incorrectCount: 0 },
      },
      examTitle: "All-India NEET Full Syllabus Mock Exam (180 Questions)",
    });

    return NextResponse.json({
      success: true,
      dna,
      hasAttempt: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load Attempt DNA" },
      { status: 500 }
    );
  }
}
