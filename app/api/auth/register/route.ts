import { NextResponse } from "next/server";
import { registerUserInMemory, RegisteredUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, targetYear, targetScore } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const newUser: RegisteredUser = {
      id: `usr_${Date.now()}`,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      role: "student",
      targetYear: targetYear || 2027,
      targetScore: targetScore || 680,
      createdAt: new Date().toISOString(),
    };

    registerUserInMemory(newUser);

    // Return success without auto-setting session so user performs login
    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Registration failed." },
      { status: 500 }
    );
  }
}
