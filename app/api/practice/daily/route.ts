import { NextResponse } from "next/server";
import { generateDailyNeetSet } from "@/lib/data/adaptive-practice";

export async function GET() {
  try {
    const dailySet = generateDailyNeetSet();
    return NextResponse.json({
      success: true,
      dailySet,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate Today's NEETora 30" },
      { status: 500 }
    );
  }
}
