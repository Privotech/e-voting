import securityConfig from "./securityConfig";

const STORAGE_KEY_ATTEMPTS = "inec_login_attempts";
const STORAGE_KEY_LOCKOUT = "inec_lockout_until";
type AttemptMap = Record<string, number[]>;
interface LockoutInfo {
  context: string;
  until: number;
}

function getAttempts(): AttemptMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) as AttemptMap : {};
  } catch {
    return {};
  }
}

function saveAttempts(attempts: AttemptMap): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
  } catch {
    // storage unavailable
  }
}

export function getLockoutInfo(): LockoutInfo | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_LOCKOUT);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (
      !data ||
      typeof data !== "object" ||
      !("until" in data) ||
      typeof data.until !== "number" ||
      !("context" in data) ||
      typeof data.context !== "string"
    ) {
      sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
      return null;
    }
    if (Date.now() > data.until) {
      sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
      return null;
    }
    return { context: data.context as string, until: data.until as number };
  } catch {
    return null;
  }
}

export function recordFailedAttempt(context = "default"): {
  locked: boolean;
  remainingAttempts: number;
  retryAfterMs?: number;
} {
  const attempts = getAttempts();
  const now = Date.now();

  if (!attempts[context]) {
    attempts[context] = [];
  }

  attempts[context] = (attempts[context] || []).filter((t) => now - t < securityConfig.lockoutDurationMs);
  attempts[context].push(now);

  if (attempts[context].length >= securityConfig.maxLoginAttempts) {
    const until = now + securityConfig.lockoutDurationMs;
    try {
      sessionStorage.setItem(STORAGE_KEY_LOCKOUT, JSON.stringify({ context, until }));
    } catch {
      // storage unavailable
    }
    return { locked: true, retryAfterMs: securityConfig.lockoutDurationMs, remainingAttempts: 0 };
  }

  saveAttempts(attempts);
  return { locked: false, remainingAttempts: securityConfig.maxLoginAttempts - attempts[context].length };
}

export function clearAttempts(context = "default"): void {
  try {
    const attempts = getAttempts();
    delete attempts[context];
    saveAttempts(attempts);
    sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
  } catch {
    // storage unavailable
  }
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "inec_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function validateSessionTimestamp(timestampStr: string | null | undefined, timeoutMs: number): boolean {
  if (!timestampStr) return false;
  const timestamp = new Date(timestampStr).getTime();
  if (isNaN(timestamp)) return false;
  return Date.now() - timestamp < timeoutMs;
}

export function sanitizeSessionData(data: unknown): Record<string, string> | null {
  if (!data || typeof data !== "object") return null;
  const allowedKeys = ["officerId", "name", "role", "nin", "state", "dob", "fullName", "authenticatedAt", "token"];
  const sanitized: Record<string, string> = {};
  for (const key of Object.keys(data)) {
    if (allowedKeys.includes(key)) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string") {
        sanitized[key] = value.replace(/[<>]/g, "").trim();
      }
    }
  }
  return sanitized;
}
