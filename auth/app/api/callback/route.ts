import configuration from "@/configuration";
import { SignalError } from "@/lib/bytes";
import {
  authSessionCookieName,
  codeVerifierCookieName,
  redirectUrlCookieName,
  returnUrlCookieName,
  stateCookieName,
} from "@/lib/constant";
import { deleteCookie, setAuthSessionCookie } from "@/lib/cookie";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";
import { v4 as uuid } from "uuid";

async function handler(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    const requestCookie = cookies();
    const returnUrlCookie = requestCookie.get(returnUrlCookieName);
    const authSessionCookie = requestCookie.get(authSessionCookieName);
    const codeVerifierCookie = requestCookie.get(codeVerifierCookieName);
    const stateCookie = requestCookie.get(stateCookieName);
    const redirectCookie = requestCookie.get(redirectUrlCookieName);

    if (!codeVerifierCookie)
      throw new SignalError("Code verifier cookie not found");

    if (!stateCookie) throw new SignalError("State cookie not found");
    if (stateCookie.value !== state) throw new SignalError("Invalid state");

    if (!redirectCookie) throw new SignalError("Redirect url cookie not found");
    if (redirectCookie.value !== configuration.portal.redirectUrl)
      throw new SignalError("Invalid redirect url");

    const tokenParams = new URLSearchParams();
    tokenParams.append("code", code as string);
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("client_id", configuration.portal.clientId);
    tokenParams.append("redirect_uri", configuration.portal.redirectUrl);
    tokenParams.append("code_verifier", codeVerifierCookie.value);

    const wellKnownResponse = await fetch(
      `${configuration.portal.issuer}/.well-known/openid-configuration`
    );

    const wellKnown = (await wellKnownResponse.json()) as {
      issuer: string;
      token_endpoint: string;
      userinfo_endpoint: string;
      end_session_endpoint: string;
    };

    if (wellKnownResponse.status !== 200) {
      throw new SignalError(wellKnown, wellKnownResponse.status);
    }

    const response = await fetch(wellKnown.token_endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    const result = (await response.json()) as {
      access_token: string;
      token_type: string;
      refresh_token: string;
      expires_in: number;
      id_token: string;
    };

    console.log(`debug:result`, result);

    if (response.status !== 200) {
      throw new SignalError(result, wellKnownResponse.status);
    }

    console.log(`status:`, response.status);
    console.log(`debug:result`, result);

    const userId = await getOAuthUserId({
      userinfoEndpoint: wellKnown.userinfo_endpoint,
      idToken: result.id_token,
      accessToken: result.access_token,
    });

    const authSession = authSessionCookie ? authSessionCookie.value : uuid();

    await prisma.userSession.updateMany({
      where: {
        authSession,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await prisma.userSession.create({
      data: {
        authSession,
        userId,
        accessToken: result.access_token,
        tokenType: result.token_type,
        expiresIn: result.expires_in,
        refreshToken: result.refresh_token,
        idToken: result.id_token,
      },
    });

    setAuthSessionCookie(authSessionCookieName, authSession);
    deleteCookie(returnUrlCookieName);
    deleteCookie(stateCookieName);
    deleteCookie(redirectUrlCookieName);
    deleteCookie(codeVerifierCookieName);

    const redirectUrl = returnUrlCookie?.value || configuration.appUrl;
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(error, { status: error.code });
  }
}

export { handler as GET, handler as POST };

async function getOAuthUserId(params: {
  userinfoEndpoint: string;
  idToken: string;
  accessToken: string;
}) {
  const { userinfoEndpoint, idToken, accessToken } = params;

  if (idToken) {
    const decodedIdToken = jwt.decode(idToken);
    console.log(`debug:decodedIdToken`, decodedIdToken);
    return decodedIdToken ? (decodedIdToken.sub as string) : null;
  }

  const userInfo = await fetch(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  console.log(`debug:userInfo`, userInfo);
  return userInfo.sub;
}
