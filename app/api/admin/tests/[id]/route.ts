import { NextResponse } from "next/server";
import { getTestById, updateTestStatus, deleteTest, TestStatus } from "@/lib/data/sample-tests";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = getTestById(id);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, test });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to retrieve test" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !["Draft", "Review", "Published", "Live"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updated = updateTestStatus(id, status as TestStatus);
    if (!updated) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, test: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update test" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteTest(id);
    if (!success) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Test deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete test" }, { status: 500 });
  }
}
