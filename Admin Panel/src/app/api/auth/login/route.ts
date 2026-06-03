import { NextResponse } from "next/server";
import { login } from "@/lib/auth-service";

export const dynamic = "force-dynamic";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

/**
 * Public login — no JWT or cookie required in request.
 * Success: JSON + Set-Cookie (admin_session)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      password?: string;
    };

    const usernameOrEmail = (body.email ?? body.username ?? "").trim();
    const password = body.password ?? "";

    const result = await login(usernameOrEmail, password);

    return NextResponse.json(result, {
      status: 200,
      headers: jsonHeaders,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400, headers: jsonHeaders }
    );
  }
}
