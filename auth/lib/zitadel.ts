export async function getWellKnown(wellKnownUrl: string) {
  const wellKnownResponse = await fetch(wellKnownUrl);

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
