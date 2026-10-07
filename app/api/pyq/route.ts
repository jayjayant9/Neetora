import { NextResponse } from "next/server";
import { getPyqQuestions, PYQ_HEATMAP_DATA } from "@/lib/data/pyq-intelligence";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const subject = searchParams.get("subject") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const questions = getPyqQuestions({ year, subject, difficulty });

    return NextResponse.json({
      success: true,
      heatmap: PYQ_HEATMAP_DATA,
      count: questions.length,
      questions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load PYQ data" },
      { status: 500 }
    );
  }
}
