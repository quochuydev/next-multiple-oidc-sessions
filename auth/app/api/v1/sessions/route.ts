import configuration from "@/configuration";
import { defaultHandler } from "@/lib/api-handler";
import { authSessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import type { APIGetSessions } from "@/types/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  origin: z.string().regex(configuration.originRegex),
});

export async function GET(request: NextRequest, res: NextResponse) {
  return defaultHandler<APIGetSessions>(
    {
      request,
      responseHeaders: {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": request.headers.get("origin") as string,
      },
    },
    async () => {
      schema.parse({
        origin: request.headers.get("origin") as string,
      });

      const requestCookie = cookies();
      const authSessionCookie = requestCookie.get(authSessionCookieName);
      if (!authSessionCookie?.value) return { sessions: [] };

      const sessions = await prisma.userSession.findMany({
        where: {
          authSession: authSessionCookie.value,
          deletedAt: null,
        },
      });

      return { sessions };
    }
  );
}
