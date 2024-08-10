import configuration from "@/configuration";
import { generateCsrfToken } from "@/lib/bytes";
import { csrfTokenCookieName } from "@/lib/constant";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const csrfToken = generateCsrfToken();
  const requestCookie = cookies();

  requestCookie.set({
    name: csrfTokenCookieName,
    value: csrfToken,
    sameSite: "strict",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 5 * 60, // 5m
  });

  return NextResponse.json({ csrfToken });
}
