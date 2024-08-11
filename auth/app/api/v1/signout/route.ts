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

    await prisma.userSession.updateMany({
      where: {
        id: body.sessionId,
        authSession,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({}, { status: 200, headers: responseHeaders });
  } catch (error) {
    return NextResponse.json(error, { status: 500, headers: responseHeaders });
  }
}
