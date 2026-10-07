// Secure File Upload, Size Guardrails & Signed Storage URLs
import crypto from "crypto";

export const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit
export const ALLOWED_MIME_TYPES = ["application/pdf"];

const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || "neetora-secure-storage-signed-key-2027";

export function sanitizeFilename(filename: string): string {
  // Strip path traversal attempts and dangerous characters
  const clean = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return clean.replace(/\.{2,}/g, "_");
}

export function validatePdfBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 25MB production limit (Size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // Magic bytes inspection: First 4 bytes must be "%PDF"
  if (buffer.length < 4) {
    return { valid: false, error: "File buffer is too short to be a valid PDF." };
  }

  const magicHeader = buffer.slice(0, 4).toString("ascii");
  if (magicHeader !== "%PDF") {
    return {
      valid: false,
      error: "Invalid file signature. File is not an authentic PDF document.",
    };
  }

  return { valid: true };
}

/**
 * Generates a tamper-proof time-limited signed URL for storage access
 */
export function generateSignedStorageUrl(
  filePath: string,
  expiresInSeconds: number = 3600
): { url: string; token: string; expiresAt: number } {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${filePath}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SIGNED_URL_SECRET).update(payload).digest("hex");
  const token = `${expiresAt}.${hmac}`;

  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const url = `/api/storage/file?path=${encodeURIComponent(cleanPath)}&token=${token}`;

  return { url, token, expiresAt };
}

/**
 * Validates a signed storage access token
 */
export function verifySignedStorageToken(filePath: string, token: string): boolean {
  if (!token || !token.includes(".")) return false;
  const [expiresStr, signature] = token.split(".");
  const expiresAt = parseInt(expiresStr, 10);

  if (isNaN(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
    return false; // Token expired
  }

  const payload = `${filePath}:${expiresAt}`;
  const expectedHmac = crypto.createHmac("sha256", SIGNED_URL_SECRET).update(payload).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac));
}
