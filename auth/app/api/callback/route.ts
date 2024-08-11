import configuration from "@/configuration";
import { SignalError } from "@/lib/bytes";
import {
  codeVerifierCookieName,
  redirectUrlCookieName,
  returnUrlCookieName,
  authSessionCookieName,
  stateCookieName,
} from "@/lib/constant";
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

    const codeVerifierCookie = requestCookie.get(codeVerifierCookieName);
    if (!codeVerifierCookie)
      throw new SignalError("Code verifier cookie not found");

    const stateCookie = requestCookie.get(stateCookieName);
    if (!stateCookie) throw new SignalError("State cookie not found");
    if (stateCookie.value !== state) throw new SignalError("Invalid state");

    const redirectCookie = requestCookie.get(redirectUrlCookieName);
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

    const authSessionCookie = requestCookie.get(authSessionCookieName);
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

    requestCookie.set({
      name: authSessionCookieName,
      value: authSession,
      sameSite: "lax",
      path: "/",
      domain: configuration.domain,
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
      maxAge: 30 * 24 * 60 * 60, // 30d
    });

    requestCookie.set({
      name: returnUrlCookieName,
      value: "",
      maxAge: 0,
      domain: new URL(configuration.appUrl).hostname,
      sameSite: "strict",
      path: "/",
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
    });

    requestCookie.set({
      name: stateCookieName,
      value: "",
      maxAge: 0,
      domain: new URL(configuration.appUrl).hostname,
      sameSite: "strict",
      path: "/",
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
    });

    requestCookie.set({
      name: redirectUrlCookieName,
      value: "",
      maxAge: 0,
      domain: new URL(configuration.appUrl).hostname,
      sameSite: "strict",
      path: "/",
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
    });

    requestCookie.set({
      name: codeVerifierCookieName,
      value: "",
      maxAge: 0,
      domain: new URL(configuration.appUrl).hostname,
      sameSite: "strict",
      path: "/",
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
    });

    const redirectUrl = returnUrlCookie?.value || configuration.appUrl;
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(error.toJSON(), { status: error.code });
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
