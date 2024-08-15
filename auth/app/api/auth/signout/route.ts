import configuration from "@/configuration";
import { authSessionCookieName, returnUrlCookieName } from "@/lib/constant";
import { setShortLiveCookie } from "@/lib/cookie";
import { prisma } from "@/lib/prisma";
import { getWellKnown } from "@/lib/zitadel";
import { authOptions } from "@/options";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      returnUrl?: string;
      sessionId: string;
    };
    const { sessionId, returnUrl } = body;
    if (!sessionId) throw new Error("invalid sessionId");

    const requestCookie = cookies();
    const authSessionCookie = requestCookie.get(authSessionCookieName);

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        authSession: authSessionCookie?.value,
      },
    });
    if (!session) throw new Error("session not found");

    const providerId = session.providerId as "portal" | "zitadel";
    const provider = authOptions.providers.find((p) => p.id === providerId);
    if (!provider) throw new Error("provider not found");

    const wellKnown = await getWellKnown(provider.wellKnown);

    const requestParams = new URLSearchParams({
      client_id: provider.clientId,
      post_logout_redirect_uri: configuration.postLogoutRedirectUri,
    });

    if (session.idToken) {
      requestParams.set("id_token_hint", session.idToken);
    }

    await prisma.session.updateMany({
      where: {
        id: sessionId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (returnUrl) setShortLiveCookie(returnUrlCookieName, returnUrl);

    const endSessionUrl = `${wellKnown.end_session_endpoint}?${requestParams}`;
    return NextResponse.json({ endSessionUrl });
  } catch (error: any) {
    return NextResponse.json(error.details || { message: error.message }, {
      status: error.code,
    });
  }
}
