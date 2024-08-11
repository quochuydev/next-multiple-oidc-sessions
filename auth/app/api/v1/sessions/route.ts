import configuration from "@/configuration";
import { authSessionCookieName } from "@/lib/constant";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
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
      ? await prisma.session.findMany({
          where: {
            authSession: authSessionCookie.value,
            deletedAt: null,
          },
          include: {
            user: true,
          },
        })
      : [];

    return NextResponse.json(
      {
        sessions: sessions.map((session) => ({
          id: session.id,
          authSession: session.authSession,
          issuer: session.issuer,
          tokenType: session.tokenType,
          accessToken: session.accessToken,
          expiresIn: session.expiresIn,
          refreshToken: session.refreshToken,
          user: transformUser(session.user),
          idToken: session.idToken,
        })),
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

function transformUser(user: Partial<User | null>) {
  if (!user) return null;

  return {
    sub: user.sub,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    preferredUsername: user.preferredUsername,
  };
}
