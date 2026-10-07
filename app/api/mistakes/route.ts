import { NextResponse } from "next/server";
import { getMistakeBook, addMistakeToBook, MistakeEntry } from "@/lib/data/mistake-book";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");

    let mistakes = getMistakeBook();
    if (subject && subject !== "all") {
      mistakes = mistakes.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: mistakes.length,
      mistakes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load mistakes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mistake, mistakes } = body;

    if (Array.isArray(mistakes)) {
      mistakes.forEach((item: MistakeEntry) => {
        addMistakeToBook(item);
      });
      return NextResponse.json({
        success: true,
        message: `${mistakes.length} mistakes saved to Mistake Book.`,
        allMistakes: getMistakeBook(),
      });
    }

    if (mistake) {
      const added = addMistakeToBook(mistake);
      return NextResponse.json({
        success: true,
        mistake: added,
        allMistakes: getMistakeBook(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid mistake payload" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save mistake" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { clearMistakes, getMistakeBook } = await import("@/lib/data/mistake-book");
    clearMistakes();
    return NextResponse.json({
      success: true,
      message: "Mistake book cleared successfully.",
      mistakes: getMistakeBook(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear mistakes" },
      { status: 500 }
    );
  }
}
