import { SignJWT, jwtVerify } from "jose";
import type { AccessType, Role, SessionUser } from "@/types/auth.types";

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
    const accessType =
      payload.accessType === "project" ? "project" : "management";

    const allowedProjectIds = Array.isArray(payload.allowedProjectIds)
      ? payload.allowedProjectIds
          .map((id) => Number(id))
          .filter(Number.isFinite)
      : [];

    const roleMasterIdRaw = payload.roleMasterId;
    const roleMasterId =
      roleMasterIdRaw === null || roleMasterIdRaw === undefined
        ? null
        : Number(roleMasterIdRaw);

    const planIdRaw = payload.planId;
    const planId =
      planIdRaw === null || planIdRaw === undefined
        ? null
        : Number(planIdRaw);

    const restaurantIdRaw = payload.restaurantId;
    const restaurantId =
      restaurantIdRaw === null || restaurantIdRaw === undefined
        ? null
        : Number(restaurantIdRaw);

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role as Role,
      accessType: accessType as AccessType,
      projectRoleId:
        payload.projectRoleId === null || payload.projectRoleId === undefined
          ? null
          : Number(payload.projectRoleId),
      projectRoleName:
        typeof payload.projectRoleName === "string"
          ? payload.projectRoleName
          : null,
      roleMasterId: Number.isFinite(roleMasterId) ? roleMasterId : null,
      roleMasterName:
        typeof payload.roleMasterName === "string"
          ? payload.roleMasterName
          : null,
      overallAccess: payload.overallAccess === true,
      allowedProjectIds,
      isClientLogin: payload.isClientLogin === true,
      restaurantId: Number.isFinite(restaurantId) ? restaurantId : null,
      restaurantName:
        typeof payload.restaurantName === "string"
          ? payload.restaurantName
          : null,
      ownerName:
        typeof payload.ownerName === "string" ? payload.ownerName : null,
      planId: Number.isFinite(planId) ? planId : null,
    };
  } catch {
    return null;
  }
}
