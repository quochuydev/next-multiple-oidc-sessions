import configuration from "@/configuration";
import { authSessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  sessionId: z.string(),
  authSession: z.string(),
  origin: z.string().regex(configuration.originRegex).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const responseHeaders = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Origin": request.headers.get("origin") as string,
  };

  try {
    const body = (await request.json()) as {
      sessionId: string;
      authSession: string;
    };

    const requestCookie = cookies();
    const authSessionCookie = requestCookie.get(authSessionCookieName);
    const authSession = authSessionCookie?.value as string;

    schema.parse({
      sessionId: body.sessionId,
      authSession,
      origin: request.headers.get("origin") as string,
    });

    const session = await prisma.session.findFirst({
      where: {
        id: body.sessionId,
      },
    });

    if (!session) throw new Error("Session not found");
    if (session.authSession !== authSession) throw new Error("Invalid session");

    await prisma.session.updateMany({
      where: {
        id: session.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (session.idToken) {
      const wellKnownResponse = await fetch(
        `${configuration.portal.issuer}/.well-known/openid-configuration`
      );

      const wellKnown = (await wellKnownResponse.json()) as {
        issuer: string;
        token_endpoint: string;
        userinfo_endpoint: string;
        end_session_endpoint: string;
      };

      if (wellKnown.end_session_endpoint) {
        await fetch(
          `${wellKnown.end_session_endpoint}?id_token_hint=${session.idToken}`
        );
      }
    }

    return NextResponse.json({}, { status: 200, headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(error, { status: 500, headers: responseHeaders });
  }
}
