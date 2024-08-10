import configuration from "@/configuration";
import { codeVerifier } from "@/lib/bytes";
import { returnUrlCookieName, sessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";
import { v4 as uuid } from "uuid";

async function handler(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const requestCookie = cookies();
  const sessionCookie = requestCookie.get(sessionCookieName);
  const returnUrl = requestCookie.get(returnUrlCookieName);

  console.log(`debug:code`, code);
  console.log(`debug:state`, state);
  console.log(`debug:sessionId`, sessionCookie?.value);
  console.log(`debug:returnUrl`, returnUrl);
  console.log(`debug:hostname`, new URL(configuration.appUrl).hostname);
  console.log("--------------");

  const tokenParams = new URLSearchParams();
  tokenParams.append("code", code as string);
  tokenParams.append("grant_type", "authorization_code");
  tokenParams.append("client_id", configuration.portal.clientId);
  tokenParams.append("redirect_uri", configuration.portal.redirectUrl);
  tokenParams.append("code_verifier", codeVerifier);

  try {
    const response = await fetch(
      `${configuration.portal.issuer}/oauth/v2/token`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams,
      }
    );

    const result = (await response.json()) as {
      access_token: string;
      token_type: string;
      refresh_token: string;
      expires_in: number;
      id_token: string;
    };

    if (response.status !== 200) {
      return NextResponse.json(result, { status: response.status });
    }

    console.log(`status:`, response.status);
    console.log(`debug:result`, result);

    const userId = await getOAuthUserId({
      idToken: result.id_token,
      accessToken: result.access_token,
    });

    const sessionId = sessionCookie ? sessionCookie.value : uuid();

    const session = await prisma.userSession.create({
      data: {
        sessionId,
        accessToken: result.access_token,
        tokenType: result.token_type,
        expiresIn: result.expires_in,
        refreshToken: result.refresh_token,
        idToken: result.id_token,
        userId,
      },
    });

    requestCookie.set({
      name: sessionCookieName,
      value: sessionId,
      sameSite: configuration.cookie.sameSite,
      path: configuration.cookie.path,
      httpOnly: configuration.cookie.httpOnly,
      secure: configuration.cookie.secure,
      domain: configuration.cookie.domain,
    });

    return NextResponse.json(
      {
        sessionId,
        session,
        result,
      },
      {
        status: response.status,
      }
    );
  } catch (error) {
    console.error("Error exchanging code for token:", error);

    return NextResponse.json(error, {
      status: 500,
    });
  }
}

export { handler as GET, handler as POST };

async function getOAuthUserId(params: {
  idToken: string;
  accessToken: string;
}) {
  const { idToken, accessToken } = params;

  if (idToken) {
    const decodedIdToken = jwt.decode(idToken);
    console.log(`debug:decodedIdToken`, decodedIdToken);
    return decodedIdToken ? (decodedIdToken.sub as string) : null;
  }

  const userInfo = await fetch(
    `${configuration.portal.issuer}/oidc/v1/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).then((res) => res.json());

  console.log(`debug:userInfo`, userInfo);
  return userInfo.sub;
}
