const BACKEND_ORIGIN = "https://basoor-family-portal.trrish.chatgpt.site";
const TOKEN_KEY = "basoor-family-session";

export function onGithubPages(): boolean {
  return typeof window !== "undefined" && (window.location.hostname === "trrishmanb-netizen.github.io" || window.location.pathname.startsWith("/Basoor-Family-Tree/"));
}

export function apiUrl(path: string): string {
  return `${onGithubPages() ? BACKEND_ORIGIN : ""}${path}`;
}

export function getAuthToken(): string | null {
  return onGithubPages() ? window.sessionStorage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token: string): void {
  if (onGithubPages()) window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (onGithubPages()) window.sessionStorage.removeItem(TOKEN_KEY);
}

export function signInUrl(): string {
  return onGithubPages() ? "#signin" : "/login";
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers, credentials: onGithubPages() ? "omit" : "same-origin" });
}
