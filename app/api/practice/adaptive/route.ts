import { NextResponse } from "next/server";
import { generateAdaptiveRecoverySet } from "@/lib/data/adaptive-practice";

export async function GET() {
  try {
    const recoverySet = generateAdaptiveRecoverySet();
    return NextResponse.json({
      success: true,
      recoverySet,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate recovery set" },
      { status: 500 }
    );
  }
}
