import { NextResponse } from "next/server";
import { logout } from "@/lib/auth-service";

export async function POST() {
  const result = await logout();

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
