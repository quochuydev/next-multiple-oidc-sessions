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
import { getWellKnown } from "@/lib/zitadel";
import { authOptions } from "@/options";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function POST(
  request: NextRequest,
  { params: { providerId } }: { params: { providerId: "portal" | "zitadel" } }
) {
  const body = (await request.json()) as {
    csrfToken: string;
    scope: string;
    returnUrl?: string;
    prompt?: string;
    loginHint?: string;
  };
  const { csrfToken, scope, returnUrl, prompt, loginHint } = body;

  const provider = authOptions.providers.find((p) => p.id === providerId);
  if (!provider) throw new Error("provider not found");

  const requestCookie = cookies();

  const csrfTokenCookie = requestCookie.get(csrfTokenCookieName);
  if (!csrfTokenCookie) throw new Error("csrfToken cookie not found");
  if (csrfTokenCookie.value !== csrfToken) throw new Error("Invalid csrfToken");

  const wellKnown = await getWellKnown(provider.wellKnown);

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const requestParams = new URLSearchParams({
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    client_id: provider.clientId,
    redirect_uri: provider.redirectUrl,
    response_type: "code",
    scope,
    state,
  });

  if (prompt) requestParams.set("prompt", prompt);
  if (loginHint) requestParams.set("login_hint", loginHint);

  if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);
  setShortLiveCookie(stateCookieName, state);
  setShortLiveCookie(redirectUrlCookieName, provider.redirectUrl);
  setShortLiveCookie(codeVerifierCookieName, codeVerifier);
  deleteCookie(csrfTokenCookieName);

  const authorizeUrl = `${wellKnown.authorization_endpoint}?${requestParams}`;
  return NextResponse.json({ authorizeUrl });
}
