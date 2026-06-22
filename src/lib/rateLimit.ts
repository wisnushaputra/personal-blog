/**
 * Generic in-memory rate limiter.
 * Catatan: Ini cukup untuk MVP single-server.
 * Untuk production multi-instance, ganti dengan Redis-based rate limiter.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

// In-memory store — reset saat server restart
const attempts = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of attempts.entries()) {
        // Find default window (15 mins) as fallback, or use a dynamic window if encoded in key
        // We will parse key structure: "scope:identifier:windowMs"
        const parts = key.split(':');
        const windowMs = parts.length === 3 ? parseInt(parts[2], 10) : 15 * 60 * 1000;
        if (now - entry.firstAttempt > windowMs) {
          attempts.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}

/**
 * Helper to generate key with windowMs encoded
 */
function makeKey(scope: string, identifier: string, windowMs: number): string {
  return `${scope}:${identifier}:${windowMs}`;
}

/**
 * Check rate limit for any scope
 */
export function checkRateLimit(
  scope: string,
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const key = makeKey(scope, identifier, windowMs);
  const entry = attempts.get(key);

  if (!entry) {
    return true;
  }

  if (now - entry.firstAttempt > windowMs) {
    attempts.delete(key);
    return true;
  }

  return entry.count < maxAttempts;
}

/**
 * Record a failed attempt or request
 */
export function recordAttempt(
  scope: string,
  identifier: string,
  windowMs: number = 15 * 60 * 1000
): void {
  const now = Date.now();
  const key = makeKey(scope, identifier, windowMs);
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAttempt > windowMs) {
    attempts.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

/**
 * Reset rate limit counter
 */
export function resetRateLimit(
  scope: string,
  identifier: string,
  windowMs: number = 15 * 60 * 1000
): void {
  const key = makeKey(scope, identifier, windowMs);
  attempts.delete(key);
}

/**
 * Get remaining time in seconds
 */
export function getRateLimitReset(
  scope: string,
  identifier: string,
  windowMs: number = 15 * 60 * 1000
): number {
  const key = makeKey(scope, identifier, windowMs);
  const entry = attempts.get(key);
  if (!entry) return 0;

  const elapsed = Date.now() - entry.firstAttempt;
  const remaining = Math.max(0, windowMs - elapsed);
  return Math.ceil(remaining / 1000);
}
