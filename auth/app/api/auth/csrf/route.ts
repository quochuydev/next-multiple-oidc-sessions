import { generateCsrfToken } from "@/lib/bytes";
import { csrfTokenCookieName } from "@/lib/constant";
import { setShortLiveCookie } from "@/lib/cookie";
import { NextResponse } from "next/server";

export async function GET() {
  const csrfToken = generateCsrfToken();
  setShortLiveCookie(csrfTokenCookieName, csrfToken);
  return NextResponse.json({ csrfToken });
}
