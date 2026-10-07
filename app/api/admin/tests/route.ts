import { NextResponse } from "next/server";
import { getStoredTests, saveTest, StoredTest, TestType, TestStatus } from "@/lib/data/sample-tests";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let tests = getStoredTests();

    if (status && status !== "all") {
      tests = tests.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (type && type !== "all") {
      tests = tests.filter((t) => t.type.toLowerCase() === type.toLowerCase());
    }

    return NextResponse.json({ success: true, tests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch tests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, type, questionIds, config, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Test name is required." }, { status: 400 });
    }

    if (!type || !["Practice", "Exam", "PYQ", "Custom"].includes(type)) {
      return NextResponse.json({ error: "Invalid test type." }, { status: 400 });
    }

    const newTest = saveTest({
      name: name.trim(),
      description: description || "",
      type: type as TestType,
      questionIds: questionIds || [],
      config: {
        durationMinutes: Number(config?.durationMinutes) || 180,
        totalQuestions: Number(config?.totalQuestions) || (questionIds?.length || 180),
        marksPerQuestion: Number(config?.marksPerQuestion) || 4,
        negativeMarks: Number(config?.negativeMarks) || -1,
        shuffleQuestions: Boolean(config?.shuffleQuestions ?? true),
        shuffleOptions: Boolean(config?.shuffleOptions ?? true),
        allowReview: Boolean(config?.allowReview ?? true),
        allowBackNavigation: Boolean(config?.allowBackNavigation ?? true),
      },
      status: (status as TestStatus) || "Draft",
    });

    return NextResponse.json({ success: true, test: newTest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create test" }, { status: 500 });
  }
}
