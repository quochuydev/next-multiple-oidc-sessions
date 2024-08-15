import configuration from "@/configuration";

type AuthOptions = {
  providers: {
    id: string;
    wellKnown: string;
    clientId: string;
    redirectUrl: string;
  }[];
};

export const authOptions: AuthOptions = {
  providers: [
    {
      id: "portal",
      wellKnown: `${configuration.portal.issuer}/.well-known/openid-configuration`,
      clientId: configuration.portal.clientId,
      redirectUrl: configuration.portal.redirectUrl,
    },
    {
      id: "zitadel",
      wellKnown: `${configuration.zitadel.issuer}/.well-known/openid-configuration`,
      clientId: configuration.zitadel.clientId,
      redirectUrl: configuration.zitadel.redirectUrl,
    },
  ],
};
