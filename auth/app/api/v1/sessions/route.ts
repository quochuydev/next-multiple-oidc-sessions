import { defaultHandler } from "@/lib/api-handler";
import { sessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import type { APIGetSessions } from "@/types/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, res: NextResponse) {
  return defaultHandler<APIGetSessions>({ request }, async () => {
    const requestCookie = cookies();
    const sessionCookie = requestCookie.get(sessionCookieName);
    const sessionId = sessionCookie ? sessionCookie.value : undefined;

    const sessions = sessionId
      ? await prisma.userSession.findMany({
          where: {
            sessionId,
            deletedAt: null,
          },
        })
      : [];

    return {
      body: {
        sessions,
      },
      headers: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": request.headers.get("origin") as string,
      },
    };
  });
}
