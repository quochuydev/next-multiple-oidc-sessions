import { URLSearchParams } from "url";
import configuration from "@/configuration";
import { NextResponse } from "next/server";
import { codeVerifier } from "@/lib/bytes";

export default async function Page({ params }: { params: { code: string } }) {
  const code = params.code;
  console.log(`debug:code`, code);

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
    console.log(`Token:`, result);

    NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error exchanging code for token:", error);

    NextResponse.json(
      {
        message: "Internal Server Error",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
