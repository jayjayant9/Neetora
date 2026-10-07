import { NextResponse } from "next/server";
import { generateBenchmarkReport } from "@/lib/data/performance-benchmarking";

export async function GET() {
  try {
    const benchmarkData = generateBenchmarkReport();
    return NextResponse.json({
      success: true,
      benchmarking: benchmarkData
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to generate benchmark report" },
      { status: 500 }
    );
  }
}
