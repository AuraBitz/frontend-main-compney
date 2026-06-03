import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types/auth.types";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-in-production"
);

export interface SessionPayload extends SessionUser {
  exp?: number;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.id !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}
