import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  targetYear?: number;
  targetScore?: number;
}

export const SESSION_COOKIE_NAME = "neetora_auth_session";

// Secret key for HMAC SHA-256 cryptographic JWT signing
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "neetora-secret-key-medical-entrance-cbt-2027"
);

// Hash password with 12 salt rounds
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

// Compare password
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

// Cryptographically sign a JWT token (30 days validity)
export async function signJWT(session: UserSession): Promise<string> {
  return new SignJWT({
    id: session.id,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    targetYear: session.targetYear,
    targetScore: session.targetScore,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setSubject(session.id)
    .sign(JWT_SECRET);
}

// Cryptographically verify a JWT token
export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    return {
      id: (payload.id as string) || (payload.sub as string),
      email: payload.email as string,
      fullName: payload.fullName as string,
      role: (payload.role as "student" | "admin") || "student",
      targetYear: payload.targetYear as number | undefined,
      targetScore: payload.targetScore as number | undefined,
    };
  } catch {
    return null;
  }
}

// Server-side session getters and setters
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function setSessionCookie(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const jwt = await signJWT(session);

  cookieStore.set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Default Seed Admin & Demo Student credentials
export const DEMO_ADMIN = {
  email: "admin@neetora.internal",
  masterKey: "neetora@admin2027",
  fullName: "Platform Administrator",
  role: "admin" as const,
};

export interface RegisteredUser {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  targetYear?: number;
  targetScore?: number;
  createdAt: string;
}

// Global singleton in-memory user registry across Next.js dev bundles
const globalForAuth = globalThis as unknown as {
  neetoraUserRegistry?: Map<string, RegisteredUser>;
};

const userRegistry = globalForAuth.neetoraUserRegistry ?? new Map<string, RegisteredUser>();
globalForAuth.neetoraUserRegistry = userRegistry;

export function registerUserInMemory(user: RegisteredUser): void {
  userRegistry.set(user.email.toLowerCase().trim(), user);
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  return userRegistry.get(email.toLowerCase().trim());
}
