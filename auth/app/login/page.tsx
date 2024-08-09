import { URLSearchParams } from "url";
import configuration from "@/configuration";
import { codeChallenge } from "@/lib/bytes";
import { redirect } from "next/navigation";

export default async function Page() {
  const params = {
    client_id: configuration.portal.clientId,
    redirect_uri: configuration.portal.redirectUrl,
    response_type: "code",
    scope: [
      "openid",
      "userinfo",
      "email",
      "profile",
      "address",
      "offline_access",
      "urn:zitadel:iam:user:resourceowner",
      "urn:zitadel:iam:org:project:id:zitadel:aud",
    ].join(" "),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state: "app-state",
  };

  const authorizeUrl = `${
    configuration.portal.issuer
  }/oauth/v2/authorize?${new URLSearchParams(params).toString()}`;

  console.log("authorizeUrl:", authorizeUrl);
  redirect(authorizeUrl);
}
