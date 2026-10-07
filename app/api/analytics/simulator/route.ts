import { NextResponse } from "next/server";
import { generateScoreSimulatorData } from "@/lib/data/score-simulator";

export async function GET() {
  try {
    const simulatorData = generateScoreSimulatorData();
    return NextResponse.json({
      success: true,
      simulator: simulatorData
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to generate score simulator data" },
      { status: 500 }
    );
  }
}
