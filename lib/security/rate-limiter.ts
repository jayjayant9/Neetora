// In-Memory Sliding Window Rate Limiter

interface RateLimitRecord {
  timestamps: number[];
}

declare global {
  // eslint-disable-next-line no-var
  var __neetora_rate_limit_store: Map<string, RateLimitRecord> | undefined;
}

if (!globalThis.__neetora_rate_limit_store) {
  globalThis.__neetora_rate_limit_store = new Map<string, RateLimitRecord>();
}

const rateLimitStore = globalThis.__neetora_rate_limit_store;

export interface RateLimitOptions {
  limit: number;       // Maximum requests allowed
  windowMs: number;    // Sliding window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60000 }
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = options.limit - record.timestamps.length;
  const oldest = record.timestamps[0];
  const resetSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));

  return {
    allowed: true,
    limit: options.limit,
    remaining,
    resetSeconds,
  };
}

// Route-specific rate limits
export const RATE_LIMITS = {
  AUTH: { limit: 12, windowMs: 60000 },       // 12 requests / min for login/register
  EXAM_SUBMIT: { limit: 20, windowMs: 60000 },// 20 requests / min for exam submit/sync
  UPLOADS: { limit: 10, windowMs: 60000 },    // 10 PDF uploads / min
  GENERAL_API: { limit: 120, windowMs: 60000 },// 120 requests / min
};
