import configuration from "@/configuration";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/lib/bytes";
import {
  codeVerifierCookieName,
  returnUrlCookieName,
  stateCookieName,
} from "@/lib/constant";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

async function handler(request: NextRequest) {
  const returnUrl = request.nextUrl.searchParams.get("returnUrl") as string;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const params = {
    client_id: configuration.portal.clientId,
    redirect_uri: configuration.portal.redirectUrl,
    response_type: "code",
    scope: [
      "openid",
      "userinfo",
      "email",
      "profile",
      "address",
      "offline_access",
      "urn:zitadel:iam:user:resourceowner",
      "urn:zitadel:iam:org:project:id:zitadel:aud",
    ].join(" "),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  };

  const authorizeUrl = `${
    configuration.portal.issuer
  }/oauth/v2/authorize?${new URLSearchParams(params).toString()}`;

  const requestCookie = cookies();

  requestCookie.set({
    name: returnUrlCookieName,
    value: returnUrl,
    sameSite: "strict",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 5 * 60, // 5m
  });

  requestCookie.set({
    name: stateCookieName,
    value: state,
    sameSite: "strict",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 5 * 60, // 5m
  });

  requestCookie.set({
    name: codeVerifierCookieName,
    value: codeVerifier,
    sameSite: "strict",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 5 * 60, // 5m
  });

  console.log("authorizeUrl:", authorizeUrl);
  return NextResponse.json({ authorizeUrl });
}

export { handler as POST };
