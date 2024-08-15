import configuration from "@/configuration";
import { returnUrlCookieName } from "@/lib/constant";
import { setShortLiveCookie } from "@/lib/cookie";
import { prisma } from "@/lib/prisma";
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

    const params: {
      client_id?: string;
      post_logout_redirect_uri?: string;
      id_token_hint?: string;
      state?: string;
    } = {
      client_id: configuration.portal.clientId,
      post_logout_redirect_uri: configuration.portal.postLogoutRedirectUri,
    };

    if (idTokenHint) params.id_token_hint = idTokenHint;
    if (state) params.state = state;

    if (idTokenHint) {
      await prisma.session.updateMany({
        where: {
          idToken: idTokenHint,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    const endSessionUrl = `${
      wellKnown.end_session_endpoint
    }?${new URLSearchParams(params).toString()}`;

    if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);

    return NextResponse.json({ endSessionUrl });
  } catch (error: any) {
    return NextResponse.json(error.details || { message: error.message }, {
      status: error.code,
    });
  }
}
