import configuration from "@/configuration";
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

async function handler(
  request: NextRequest,
  { params }: { params: { provider: "portal" | "zitadel" } }
) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    const requestCookie = cookies();
    const returnUrlCookie = requestCookie.get(returnUrlCookieName);
    const codeVerifierCookie = requestCookie.get(codeVerifierCookieName);
    const stateCookie = requestCookie.get(stateCookieName);
    const redirectCookie = requestCookie.get(redirectUrlCookieName);
    const authSessionCookie = requestCookie.get(authSessionCookieName);
    const authSession = authSessionCookie ? authSessionCookie.value : uuid();

    if (!codeVerifierCookie) throw new Error("Code verifier cookie not found");

    if (!stateCookie) throw new Error("State cookie not found");
    if (stateCookie.value !== state) throw new Error("Invalid state");

    if (!redirectCookie) throw new Error("Redirect url cookie not found");
    if (redirectCookie.value !== configuration.redirectUrl)
      throw new Error("Invalid redirect url");

    const provider = params.provider;
    if (!provider) throw new Error("provider not found");

    const tokenParams = new URLSearchParams();
    tokenParams.append("code", code as string);
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("client_id", configuration[provider].clientId);
    tokenParams.append("redirect_uri", configuration.redirectUrl);
    tokenParams.append("code_verifier", codeVerifierCookie.value);

    const wellKnownResponse = await fetch(
      `${configuration[provider].issuer}/.well-known/openid-configuration`
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

    const response = await fetch(wellKnown.token_endpoint, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams as BodyInit,
    });

    const result = (await response.json()) as {
      access_token: string;
      token_type: string;
      refresh_token: string;
      expires_in: number;
      id_token: string;
    };

    if (response.status !== 200) {
      throw { code: response.status, details: result };
    }

    const userInfo = await getOAuthUserInfo({
      userinfoEndpoint: wellKnown.userinfo_endpoint,
      idToken: result.id_token,
      accessToken: result.access_token,
    });

    const user = await upsertUser(userInfo);

    await prisma.session.updateMany({
      where: {
        authSession,
        userId: user.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await prisma.session.create({
      data: {
        authSession,
        issuer: wellKnown.issuer,
        accessToken: result.access_token,
        tokenType: result.token_type,
        expiresIn: result.expires_in,
        refreshToken: result.refresh_token,
        idToken: result.id_token,
        user: {
          connect: {
            id: user.id,
          },
        },
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

    return NextResponse.json(error.details || { message: error.message }, {
      status: error.code,
    });
  }
}

export { handler as GET, handler as POST };

async function getOAuthUserInfo(params: {
  userinfoEndpoint: string;
  idToken: string;
  accessToken: string;
}) {
  const { userinfoEndpoint, idToken, accessToken } = params;

  if (idToken) {
    const decodedIdToken = jwt.decode(idToken);
    return decodedIdToken as {
      sub: string;
      email: string;
      email_verified: boolean;
      name: string;
      preferred_username: string;
    };
  }

  const userInfo = await fetch(userinfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());

  return userInfo as {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
  };
}

async function upsertUser(userInfo: {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
}) {
  console.log(`debug:userInfo`, userInfo);

  const existingUser = await prisma.user.findFirst({
    where: {
      sub: userInfo.sub,
    },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        sub: userInfo.sub,
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        name: userInfo.name,
        preferredUsername: userInfo.preferred_username,
      },
    });

    return user;
  }

  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      sub: userInfo.sub,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      name: userInfo.name,
      preferredUsername: userInfo.preferred_username,
    },
  });

  return existingUser;
}
