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
    if (!sessionId) return { sessions: [] };

    const sessions = await prisma.userSession.findMany({
      where: {
        sessionId,
      },
    });

    return { sessions };
  });
}
