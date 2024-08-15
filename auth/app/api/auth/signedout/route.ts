import configuration from "@/configuration";
import { returnUrlCookieName } from "@/lib/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function handler() {
  const requestCookie = cookies();
  const returnUrlCookie = requestCookie.get(returnUrlCookieName);
  const redirectUrl = returnUrlCookie?.value || configuration.appUrl;
  return NextResponse.redirect(redirectUrl);
}

export { handler as GET, handler as POST };
