import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminToken, getAdminCookieOptions, validateAdminCredentials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "");
    const password = String(body.password || "");

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json({ error: "Wrong admin username or password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(), getAdminCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
