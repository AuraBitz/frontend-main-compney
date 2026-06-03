import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-service";

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ success: true, user }, { status: 200 });
}
