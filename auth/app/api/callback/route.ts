import { URLSearchParams } from "url";
import configuration from "@/configuration";
import { NextRequest, NextResponse } from "next/server";
import { codeVerifier } from "@/lib/bytes";
import { v4 as uuid } from "uuid";
import { setCookie } from "@/lib/cookie";

async function handler(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  console.log(`debug:code`, code);
  console.log(`debug:state`, state);

  const tokenParams = new URLSearchParams();
  tokenParams.append("code", code as string);
  tokenParams.append("grant_type", "authorization_code");
  tokenParams.append("client_id", configuration.portal.clientId);
  tokenParams.append("redirect_uri", configuration.portal.redirectUrl);
  tokenParams.append("code_verifier", codeVerifier);

  try {
    const response = await fetch(
      `${configuration.portal.issuer}/oauth/v2/token`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams,
      }
    );

    const result = await response.json();
    console.log(`status:`, response.status);
    console.log(`result:`, result);

    setCookie("sessionId", uuid());

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error("Error exchanging code for token:", error);

    return NextResponse.json(
      {
        message: "Bad request",
        error,
      },
      {
        status: 400,
      }
    );
  }
}

export { handler as GET, handler as POST };
