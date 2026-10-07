import { NextResponse } from "next/server";
import { setSessionCookie, UserSession, findUserByEmail } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const registered = findUserByEmail(cleanEmail);

    const session: UserSession = {
      id: registered ? registered.id : `usr_student_active`,
      email: cleanEmail,
      fullName: registered ? registered.fullName : cleanEmail.split("@")[0],
      role: "student",
      targetYear: registered?.targetYear || 2027,
      targetScore: registered?.targetScore || 680,
    };

    await setSessionCookie(session);

    return NextResponse.json({ success: true, user: session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Login failed." },
      { status: 500 }
    );
  }
}
