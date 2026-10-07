import { NextResponse } from "next/server";
import { validatePdfBuffer, sanitizeFilename, generateSignedStorageUrl } from "@/lib/security/secure-upload";
import { logAuditEvent } from "@/lib/security/audit-logger";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sourceYear = formData.get("year")?.toString() || "2025";
    const source = formData.get("source")?.toString() || "NEET PYQ";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    const safeFilename = sanitizeFilename(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Secure PDF Validation (Size & Magic bytes inspection)
    const validation = validatePdfBuffer(buffer);
    if (!validation.valid) {
      logAuditEvent({
        eventType: "FILE_UPLOAD_BLOCKED",
        severity: "warning",
        details: `Blocked upload for ${safeFilename}: ${validation.error}`,
        metadata: { filename: safeFilename, sizeBytes: file.size }
      });

      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Generate Tamper-Proof Signed Storage URL (1 hour validity)
    const storagePath = `uploads/papers/${Date.now()}_${safeFilename}`;
    const signedAccess = generateSignedStorageUrl(storagePath, 3600);

    logAuditEvent({
      eventType: "FILE_UPLOAD_SUCCESS",
      severity: "info",
      details: `Securely ingested PDF paper ${safeFilename} (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
      metadata: { filename: safeFilename, sizeBytes: file.size, storagePath }
    });

    return NextResponse.json({
      success: true,
      file: {
        id: `pdf-${Date.now()}`,
        fileName: safeFilename,
        fileSizeBytes: file.size,
        source,
        sourceYear: parseInt(sourceYear, 10),
        signedUrl: signedAccess.url,
        expiresAt: signedAccess.expiresAt,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("PDF Upload Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process upload." },
      { status: 500 }
    );
  }
}
