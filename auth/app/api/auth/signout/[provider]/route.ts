import configuration from "@/configuration";
import { authSessionCookieName, returnUrlCookieName } from "@/lib/constant";
import { setShortLiveCookie } from "@/lib/cookie";
import { prisma } from "@/lib/prisma";
import { getWellKnown } from "@/lib/zitadel";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: "portal" | "zitadel" } }
) {
  try {
    const body = (await request.json()) as {
      returnUrl?: string;
      idTokenHint?: string;
      clientId?: string;
      postLogoutRedirectUri?: string;
      state?: string;
    };
    const { returnUrl, idTokenHint, state } = body;

    const provider = params.provider;
    if (!provider) throw new Error("provider not found");

    const wellKnown = await getWellKnown(configuration[provider].issuer);

    const requestParams = new URLSearchParams({
      client_id: configuration[provider].clientId,
      post_logout_redirect_uri: configuration.postLogoutRedirectUri,
    });

    if (state) requestParams.set("state", state);
    if (idTokenHint) requestParams.set("id_token_hint", idTokenHint);

    const requestCookie = cookies();
    const authSessionCookie = requestCookie.get(authSessionCookieName);

    if (authSessionCookie?.value) {
      const sessionWhereInput: Prisma.SessionWhereInput = {
        authSession: authSessionCookie.value,
      };

      if (idTokenHint) {
        sessionWhereInput.idToken = idTokenHint;
      }

      await prisma.session.updateMany({
        where: sessionWhereInput,
        data: {
          deletedAt: new Date(),
        },
      });
    }

    if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);

    const endSessionUrl = `${wellKnown.end_session_endpoint}?${requestParams}`;

    return NextResponse.json({ endSessionUrl });
  } catch (error: any) {
    return NextResponse.json(error.details || { message: error.message }, {
      status: error.code,
    });
  }
}
