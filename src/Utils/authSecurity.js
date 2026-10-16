import securityConfig from "./securityConfig";

const STORAGE_KEY_ATTEMPTS = "inec_login_attempts";
const STORAGE_KEY_LOCKOUT = "inec_lockout_until";

function getAttempts() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ATTEMPTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAttempts(attempts) {
  try {
    sessionStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(attempts));
  } catch {
    // storage unavailable
  }
}

export function getLockoutInfo() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_LOCKOUT);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() > data.until) {
      sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function recordFailedAttempt(context = "default") {
  const attempts = getAttempts();
  const now = Date.now();

  if (!attempts[context]) {
    attempts[context] = [];
  }

  attempts[context] = attempts[context].filter((t) => now - t < securityConfig.lockoutDurationMs);
  attempts[context].push(now);

  if (attempts[context].length >= securityConfig.maxLoginAttempts) {
    const until = now + securityConfig.lockoutDurationMs;
    try {
      sessionStorage.setItem(STORAGE_KEY_LOCKOUT, JSON.stringify({ context, until }));
    } catch {
      // storage unavailable
    }
    return { locked: true, retryAfterMs: securityConfig.lockoutDurationMs };
  }

  saveAttempts(attempts);
  return { locked: false, remainingAttempts: securityConfig.maxLoginAttempts - attempts[context].length };
}

export function clearAttempts(context = "default") {
  try {
    const attempts = getAttempts();
    delete attempts[context];
    saveAttempts(attempts);
    sessionStorage.removeItem(STORAGE_KEY_LOCKOUT);
  } catch {
    // storage unavailable
  }
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "inec_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function validateSessionTimestamp(timestampStr, timeoutMs) {
  if (!timestampStr) return false;
  const timestamp = new Date(timestampStr).getTime();
  if (isNaN(timestamp)) return false;
  return Date.now() - timestamp < timeoutMs;
}

export function sanitizeSessionData(data) {
  if (!data || typeof data !== "object") return null;
  const allowedKeys = ["officerId", "name", "role", "nin", "state", "dob", "fullName"];
  const sanitized = {};
  for (const key of Object.keys(data)) {
    if (allowedKeys.includes(key)) {
      const value = data[key];
      if (typeof value === "string") {
        sanitized[key] = value.replace(/[<>]/g, "").trim();
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}
