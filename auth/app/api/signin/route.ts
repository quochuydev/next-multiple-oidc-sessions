import configuration from "@/configuration";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
  SignalError,
} from "@/lib/bytes";
import {
  codeVerifierCookieName,
  csrfTokenCookieName,
  redirectUrlCookieName,
  returnUrlCookieName,
  stateCookieName,
} from "@/lib/constant";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    returnUrl: string;
    csrfToken: string;
  };
  const { returnUrl, csrfToken } = body;

  const requestCookie = cookies();

  const csrfTokenCookie = requestCookie.get(csrfTokenCookieName);
  if (!csrfTokenCookie) throw new SignalError("csrfToken cookie not found");
  if (csrfTokenCookie.value !== csrfToken)
    throw new SignalError("Invalid state");

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

  requestCookie.set({
    name: returnUrlCookieName,
    value: returnUrl,
    maxAge: 5 * 60, // 5m
    domain: new URL(configuration.appUrl).hostname,
    sameSite: "strict",
    path: "/",
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
  });

  requestCookie.set({
    name: stateCookieName,
    value: state,
    maxAge: 5 * 60, // 5m
    domain: new URL(configuration.appUrl).hostname,
    sameSite: "strict",
    path: "/",
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
  });

  requestCookie.set({
    name: redirectUrlCookieName,
    value: configuration.portal.redirectUrl,
    maxAge: 5 * 60, // 5m
    domain: new URL(configuration.appUrl).hostname,
    sameSite: "strict",
    path: "/",
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
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

  requestCookie.set({
    name: csrfTokenCookieName,
    value: "",
    sameSite: "strict",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 0,
  });

  console.log("authorizeUrl:", authorizeUrl);
  return NextResponse.json({ authorizeUrl });
}
