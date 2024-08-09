import { defaultHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import type { APIGetSessions } from "@/types/api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return defaultHandler<APIGetSessions>({ request }, async () => {
    return {
      sessions: [],
    };
  });
}
