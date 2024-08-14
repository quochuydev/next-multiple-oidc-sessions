import configuration from "@/configuration";
import { returnUrlCookieName } from "@/lib/constant";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const requestCookie = cookies();
  const returnUrlCookie = requestCookie.get(returnUrlCookieName);
  const redirectUrl = returnUrlCookie?.value || configuration.appUrl;
  return NextResponse.redirect(redirectUrl);
}
