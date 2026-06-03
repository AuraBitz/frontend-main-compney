import type { SessionUser } from "@/types/auth.types";

export type LoginActionResult =
  | { success: true; user: SessionUser }
  | { success: false; error: string };

export type LogoutActionResult =
  | { success: true }
  | { success: false; error: string };
