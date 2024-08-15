import configuration from "@/configuration";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/lib/bytes";
import {
  codeVerifierCookieName,
  csrfTokenCookieName,
  redirectUrlCookieName,
  returnUrlCookieName,
  stateCookieName,
} from "@/lib/constant";
import { deleteCookie, setShortLiveCookie } from "@/lib/cookie";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    csrfToken: string;
    scope: string;
    returnUrl?: string;
    prompt?: string;
    loginHint?: string;
  };
  const { csrfToken, scope, returnUrl, prompt, loginHint } = body;

  const requestCookie = cookies();

  const csrfTokenCookie = requestCookie.get(csrfTokenCookieName);
  if (!csrfTokenCookie) throw new Error("csrfToken cookie not found");
  if (csrfTokenCookie.value !== csrfToken) throw new Error("Invalid csrfToken");

  const wellKnownResponse = await fetch(
    `${configuration.portal.issuer}/.well-known/openid-configuration`
  );

  const wellKnown = (await wellKnownResponse.json()) as {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint: string;
  };

  if (wellKnownResponse.status !== 200) {
    throw { code: wellKnownResponse.status, details: wellKnown };
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const params = new URLSearchParams({
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    client_id: configuration.portal.clientId,
    redirect_uri: configuration.portal.redirectUrl,
    response_type: "code",
    scope,
    state,
  });

  if (prompt) params.set("prompt", prompt);
  if (loginHint) params.set("login_hint", loginHint);

  if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);
  setShortLiveCookie(stateCookieName, state);
  setShortLiveCookie(redirectUrlCookieName, configuration.portal.redirectUrl);
  setShortLiveCookie(codeVerifierCookieName, codeVerifier);
  deleteCookie(csrfTokenCookieName);

  const authorizeUrl = `${wellKnown.authorization_endpoint}?${params}`;
  return NextResponse.json({ authorizeUrl });
}
