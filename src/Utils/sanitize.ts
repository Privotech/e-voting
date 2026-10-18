const ESCAPE_REGEX = /[&<>'"]/g;
const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};

type SanitizableValue = string | number | boolean | null | undefined;
type FormData = Record<string, unknown>;

export function escapeHtml(str: SanitizableValue): string {
  if (typeof str !== "string") return String(str);
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_MAP[match] || match);
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

export function sanitizeForAttribute(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/["'<>]/g, "").trim();
}

export function sanitizeFilename(name: unknown): string {
  if (typeof name !== "string") return "file";
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, "_").trim() || "file";
}

export function sanitizeFormData<T extends FormData>(data: T): T;
export function sanitizeFormData(data: unknown): unknown;
export function sanitizeFormData(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;
  const sanitized: Record<string, unknown> = {};
  const formData = data as Record<string, unknown>;
  for (const key of Object.keys(data)) {
    const value = formData[key];
    if (typeof value === "string") {
      sanitized[key] = value.replace(/[<>]/g, "").trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
