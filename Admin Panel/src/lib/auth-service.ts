import { cookies } from "next/headers";
import { USE_MOCK } from "@/services/api/config";
import { loginWithBackend, logoutWithBackend } from "@/lib/auth-api.server";
import type { BackendLoginAccount } from "@/services/api/login.api";
import { createSessionToken, verifySessionToken } from "@/lib/auth-token";
import {
  BACKEND_ACCESS_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/constants";
import type {
  LoginActionResult,
  LogoutActionResult,
} from "@/types/auth-action.types";
import type { Role, SessionUser } from "@/types/auth.types";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const BACKEND_ROLES: Role[] = ["super_admin", "admin", "manager", "viewer"];

const MOCK_USERS: (SessionUser & { password: string })[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "super@admin.com",
    password: "admin123",
    role: "super_admin",
  },
  {
    id: "2",
    name: "Company Admin",
    email: "admin@company.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "3",
    name: "Product Manager",
    email: "manager@company.com",
    password: "admin123",
    role: "manager",
  },
  {
    id: "4",
    name: "Read Only User",
    email: "viewer@company.com",
    password: "admin123",
    role: "viewer",
  },
];

function fail(message: string): LoginActionResult {
  return { success: false, error: message };
}

function mapBackendRole(role: string): Role {
  if (BACKEND_ROLES.includes(role as Role)) return role as Role;
  if (role === "client") return "admin";
  return "viewer";
}

function omitPassword<T extends { password: string }>(
  user: T
): Omit<T, "password"> {
  const { password, ...sessionUser } = user;
  void password;
  return sessionUser;
}

function mapBackendUser(account: BackendLoginAccount): SessionUser {
  const name =
    account.username?.trim() ||
    account.email?.split("@")[0] ||
    "User";

  return {
    id: String(account.id),
    name,
    email: account.email,
    role: mapBackendRole(account.role ?? "client"),
  };
}

async function resolveSession(token: string): Promise<SessionUser | null> {
  if (USE_MOCK) {
    const payload = await verifySessionToken(token);
    if (!payload?.id) return null;
    const user = MOCK_USERS.find((u) => u.id === payload.id);
    if (!user) return null;
    return omitPassword(user);
  }
  return verifySessionToken(token);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return resolveSession(token);
  } catch {
    return null;
  }
}

export async function login(
  usernameOrEmail: string,
  password: string
): Promise<LoginActionResult> {
  const identifier = usernameOrEmail.trim();

  if (!identifier || !password) {
    return fail("Username/email and password are required.");
  }

  try {
    let user: SessionUser;
    let token: string;

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const found = MOCK_USERS.find(
        (u) =>
          (u.email === identifier ||
            u.name.toLowerCase() === identifier.toLowerCase()) &&
          u.password === password
      );
      if (!found) return fail("Invalid username/email or password");
      user = omitPassword(found);
      token = await createSessionToken(user);
    } else {
      const data = await loginWithBackend(identifier, password);
      user = mapBackendUser(data.user);
      token = await createSessionToken(user);

      const cookieStore = await cookies();
      cookieStore.set(BACKEND_ACCESS_COOKIE_NAME, data.token, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE,
      });
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: SESSION_MAX_AGE,
      });

      return { success: true, user };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE,
    });

    return { success: true, user };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Login failed. Please try again.";
    return fail(message);
  }
}

export async function logout(): Promise<LogoutActionResult> {
  try {
    const cookieStore = await cookies();
    const backendToken = cookieStore.get(BACKEND_ACCESS_COOKIE_NAME)?.value;

    if (backendToken && !USE_MOCK) {
      await logoutWithBackend(backendToken);
    }

    cookieStore.delete(BACKEND_ACCESS_COOKIE_NAME);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logout failed.";
    return { success: false, error: message };
  }
}
