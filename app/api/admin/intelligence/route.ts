import { NextResponse } from "next/server";
import { getAdminIntelligenceData } from "@/lib/data/admin-intelligence";

export async function GET() {
  try {
    const data = getAdminIntelligenceData();
    return NextResponse.json({
      success: true,
      intelligence: data
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve admin intelligence data" },
      { status: 500 }
    );
  }
}
