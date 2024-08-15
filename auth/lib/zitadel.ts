export async function getWellKnown(issuer: string) {
  const wellKnownResponse = await fetch(
    new URL(`/.well-known/openid-configuration`, issuer).toString()
  );

  const wellKnown = (await wellKnownResponse.json()) as {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    userinfo_endpoint: string;
    end_session_endpoint: string;
  };

  if (wellKnownResponse.status !== 200) {
    throw { code: wellKnownResponse.status, details: wellKnown };
  }

  return wellKnown;
}
