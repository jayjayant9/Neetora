import { NextResponse } from "next/server";
import { updateMistakeReason, MistakeReason } from "@/lib/data/mistake-book";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mistakeId, reason } = body;

    if (!mistakeId || !reason) {
      return NextResponse.json(
        { success: false, error: "mistakeId and reason are required" },
        { status: 400 }
      );
    }

    const updated = updateMistakeReason(mistakeId, reason as MistakeReason);

    return NextResponse.json({
      success: updated,
      mistakeId,
      reason,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update classification" },
      { status: 500 }
    );
  }
}
