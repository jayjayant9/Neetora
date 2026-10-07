// Production Audit Logging Engine

export type AuditEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_REGISTER_SUCCESS"
  | "AUTH_LOGOUT"
  | "EXAM_STARTED"
  | "EXAM_AUTOSAVED"
  | "EXAM_SUBMITTED"
  | "EXAM_LOCKED"
  | "RATE_LIMIT_EXCEEDED"
  | "FILE_UPLOAD_BLOCKED"
  | "FILE_UPLOAD_SUCCESS"
  | "ADMIN_QUESTION_MUTATED"
  | "SECURITY_ANOMALY";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: "info" | "warning" | "critical";
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: string;
  metadata?: Record<string, any>;
}

declare global {
  // eslint-disable-next-line no-var
  var __neetora_audit_logs: AuditLogEntry[] | undefined;
}

if (!globalThis.__neetora_audit_logs) {
  globalThis.__neetora_audit_logs = [];
}

const auditLogsStore = globalThis.__neetora_audit_logs;
const MAX_AUDIT_LOGS = 1000;

export function logAuditEvent(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
  const completeEntry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogsStore.unshift(completeEntry);

  // Keep circular buffer capped at MAX_AUDIT_LOGS
  if (auditLogsStore.length > MAX_AUDIT_LOGS) {
    auditLogsStore.pop();
  }

  return completeEntry;
}

export function getRecentAuditLogs(limit: number = 50): AuditLogEntry[] {
  return auditLogsStore.slice(0, limit);
}
