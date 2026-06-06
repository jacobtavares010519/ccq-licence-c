const SESSION_KEY = "novolt_session";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(SESSION_KEY);
}

export function login(email: string, _password: string): { error?: string } {
  if (!email.trim()) return { error: "Email is required." };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, loginAt: Date.now() }));
  return {};
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): { email: string } | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}
