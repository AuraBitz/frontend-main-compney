import axios from "axios";
import { buildLoginPayload } from "@/lib/login-payload";
import { API_PREFIX, API_SERVER_URL } from "@/services/api/config";
import type { BackendLoginData } from "@/services/api/login.api";
import type { BackendErrorResponse, BackendSuccessResponse } from "@/services/api/types";

function unwrapResponseData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as BackendSuccessResponse<T>).success === true &&
    "data" in payload
  ) {
    return (payload as BackendSuccessResponse<T>).data;
  }
  return payload as T;
}

function getApiErrorMessage(data: unknown, status?: number): string {
  if (status === 401) {
    return "Invalid username/email or password.";
  }
  if (status === 500) {
    return `Backend not running on ${API_SERVER_URL}. Run: cd backend && npm run dev`;
  }

  if (typeof data === "string" && data.trim()) {
    if (data.startsWith("<!DOCTYPE") || data.startsWith("<html")) {
      return `API not reachable at ${API_SERVER_URL}. Start backend on port 4000.`;
    }
    if (data === "Internal Server Error") {
      return `Backend not running on ${API_SERVER_URL}. Run: cd backend && npm run dev`;
    }
    return data;
  }

  const body = data as BackendErrorResponse | undefined;
  if (body?.message?.trim()) return body.message;

  if (status === 404) {
    return `Login API not found at ${API_SERVER_URL}${API_PREFIX}`;
  }
  if (!status) {
    return `Cannot reach API at ${API_SERVER_URL}. Start backend: cd backend && npm run dev`;
  }

  return "Login failed. Please try again.";
}

export async function loginWithBackend(
  usernameOrEmail: string,
  password: string
): Promise<BackendLoginData> {
  const url = `${API_SERVER_URL}${API_PREFIX}/client-login/login`;
  const payload = buildLoginPayload(usernameOrEmail, password);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 15_000,
      validateStatus: () => true,
    });

    if (response.status >= 400) {
      throw new Error(getApiErrorMessage(response.data, response.status));
    }

    const data = unwrapResponseData<BackendLoginData>(response.data);

    if (!data?.user || typeof data.user.id === "undefined") {
      throw new Error("Invalid login response from API.");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Login failed. Please try again.");
  }
}

export async function logoutWithBackend(token: string): Promise<void> {
  const url = `${API_SERVER_URL}${API_PREFIX}/client-login/logout`;

  try {
    await axios.post(
      url,
      {},
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 10_000,
        validateStatus: () => true,
      }
    );
  } catch {
    /* always clear local session */
  }
}
