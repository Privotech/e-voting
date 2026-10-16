const TOKEN_KEY = "inec_form_token";

export function generateCsrfToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getCsrfToken() {
  try {
    let token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = generateCsrfToken();
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return generateCsrfToken();
  }
}

export function validateCsrfToken(token) {
  if (!token) return false;
  const stored = getCsrfToken();
  return token === stored;
}

export function rotateCsrfToken() {
  try {
    const newToken = generateCsrfToken();
    sessionStorage.setItem(TOKEN_KEY, newToken);
    return newToken;
  } catch {
    return generateCsrfToken();
  }
}
