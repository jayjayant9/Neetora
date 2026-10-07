import { NextResponse } from "next/server";
import { getRecentAuditLogs } from "@/lib/security/audit-logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

    const logs = getRecentAuditLogs(limit);
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve audit logs." },
      { status: 500 }
    );
  }
}
