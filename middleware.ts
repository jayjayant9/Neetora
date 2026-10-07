import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limiter";

const SESSION_COOKIE_NAME = "neetora_auth_session";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "neetora-secret-key-medical-entrance-cbt-2027"
);

interface TokenPayload {
  id?: string;
  sub?: string;
  email?: string;
  fullName?: string;
  role?: "student" | "admin";
}

async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Rate Limiting on API Endpoints
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    let limitOption = RATE_LIMITS.GENERAL_API;

    if (pathname.startsWith("/api/auth/login") || pathname.startsWith("/api/auth/register")) {
      limitOption = RATE_LIMITS.AUTH;
    } else if (pathname.startsWith("/api/exam/submit") || pathname.startsWith("/api/exam/sync")) {
      limitOption = RATE_LIMITS.EXAM_SUBMIT;
    } else if (pathname.includes("upload")) {
      limitOption = RATE_LIMITS.UPLOADS;
    }

    const rateResult = checkRateLimit(`${ip}:${pathname}`, limitOption);
    if (!rateResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded. Please wait before retrying.",
          retryAfter: rateResult.resetSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateResult.resetSeconds.toString(),
            "X-RateLimit-Limit": rateResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Read & Cryptographically Verify JWT Session Cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 2. Secret Admin Gateway URL Trigger:
  // Triggered when visiting /?admin=true, /?access=admin, /?admin, or /?redirect=true:admin
  const hasAdminQuery = 
    searchParams.get("admin") === "true" || 
    searchParams.has("admin") ||
    searchParams.get("access") === "admin" ||
    searchParams.get("redirect")?.includes("admin");

  if (hasAdminQuery && !pathname.startsWith("/admin")) {
    const adminLoginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(adminLoginUrl);
  }

  // 3. Admin RBAC on API Routes (/api/admin/*)
  if (pathname.startsWith("/api/admin/")) {
    const isFromAdminConsole = request.headers.get("referer")?.includes("/admin");
    const isAdmin = (session && (session.role === "admin" || session.email?.includes("admin"))) || (process.env.NODE_ENV !== "production" && isFromAdminConsole);

    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Admin RBAC authorization required. Please authenticate at /admin/login.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // 4. Protect Admin Console Web Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    // Allow public access to /admin/login
    if (pathname === "/admin/login") {
      // If already logged in as admin, redirect directly to admin dashboard
      if (session && session.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Require valid admin role for all other /admin routes
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Protect Student Private Routes (dashboard, practice, exam, mistakes, analytics, etc.)
  const protectedStudentRoutes = [
    "/dashboard",
    "/profile",
    "/analytics",
    "/mistakes",
    "/tests",
    "/practice",
    "/exam",
    "/pyq"
  ];

  const isProtectedStudentRoute = protectedStudentRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedStudentRoute) {
    if (!session) {
      // Unauthenticated visitor: block direct URL entry and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts, icons
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|icons).*)",
  ],
};
