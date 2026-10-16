const ESCAPE_REGEX = /[&<>'"]/g;
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
};

export function escapeHtml(str) {
  if (typeof str !== "string") return String(str);
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_MAP[match] || match);
}

export function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim();
}

export function sanitizeForAttribute(value) {
  if (typeof value !== "string") return "";
  return value.replace(/["'<>]/g, "").trim();
}

export function sanitizeFilename(name) {
  if (typeof name !== "string") return "file";
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, "_").trim() || "file";
}

export function sanitizeFormData(data) {
  if (typeof data !== "object" || data === null) return data;
  const sanitized = {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === "string") {
      sanitized[key] = value.replace(/[<>]/g, "").trim();
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
