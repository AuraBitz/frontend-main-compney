import { buildLoginPayload } from "@/lib/login-payload";
import type {
  LoginActionResult,
  LogoutActionResult,
} from "@/types/auth-action.types";
import type { SessionUser } from "@/types/auth.types";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error("Empty response from server.");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response from server.");
  }
}

export async function loginRequest(
  usernameOrEmail: string,
  password: string
): Promise<LoginActionResult> {
  const payload = buildLoginPayload(usernameOrEmail, password);

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
    cache: "no-store",
  });

  const data = await parseJson<LoginActionResult>(response);

  if (!data.success) {
    return data;
  }

  if (!response.ok) {
    return {
      success: false,
      error: "Login failed. Please try again.",
    };
  }

  return data;
}

export async function logoutRequest(): Promise<LogoutActionResult> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  const data = await parseJson<LogoutActionResult>(response);

  if (!data.success) {
    return { success: false, error: data.error ?? "Logout failed." };
  }

  return data;
}

export async function getSessionRequest(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await parseJson<{ success: boolean; user: SessionUser | null }>(
    response
  );
  return data.user ?? null;
}
