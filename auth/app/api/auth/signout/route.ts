import configuration from "@/configuration";
import { authSessionCookieName, returnUrlCookieName } from "@/lib/constant";
import { setShortLiveCookie } from "@/lib/cookie";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      returnUrl?: string;
      idTokenHint?: string;
      clientId?: string;
      postLogoutRedirectUri?: string;
      state?: string;
    };
    const { returnUrl, idTokenHint, state } = body;

    const requestCookie = cookies();
    const authSessionCookie = requestCookie.get(authSessionCookieName);
    const authSession = authSessionCookie?.value;

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

    const params = new URLSearchParams({
      client_id: configuration.portal.clientId,
      post_logout_redirect_uri: configuration.portal.postLogoutRedirectUri,
    });

    if (state) params.set("state", state);

    const sessionWhereInput: Prisma.SessionWhereInput = {
      authSession: authSessionCookie?.value,
    };

    if (idTokenHint) {
      params.set("id_token_hint", idTokenHint);
      sessionWhereInput.idToken = idTokenHint;
    }

    await prisma.session.updateMany({
      where: sessionWhereInput,
      data: {
        deletedAt: new Date(),
      },
    });

    if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);

    const endSessionUrl = `${wellKnown.end_session_endpoint}?${params}`;

    return NextResponse.json({ endSessionUrl });
  } catch (error: any) {
    return NextResponse.json(error.details || { message: error.message }, {
      status: error.code,
    });
  }
}
