import configuration from "@/configuration";
import { authSessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const schema = z.object({
  origin: z.string().regex(configuration.originRegex).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const responseHeaders = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Origin": request.headers.get("origin") as string,
  };

  try {
    schema.parse({
      origin: request.headers.get("origin") as string,
    });

    const requestCookie = cookies();
    const authSessionCookie = requestCookie.get(authSessionCookieName);

    const sessions = authSessionCookie?.value
      ? await prisma.userSession.findMany({
          where: {
            authSession: authSessionCookie.value,
            deletedAt: null,
          },
        })
      : [];

    return NextResponse.json(
      {
        sessions,
      },
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
}
