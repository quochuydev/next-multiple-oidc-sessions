import configuration from "@/configuration";

type AuthOptions = {
  providers: {
    id: string;
    wellKnown: string;
    clientId: string;
  }[];
};

export const authOptions: AuthOptions = {
  providers: [
    {
      id: "portal",
      wellKnown: `${configuration.portal.issuer}/.well-known/openid-configuration`,
      clientId: configuration.portal.clientId,
    },
    {
      id: "zitadel",
      wellKnown: `${configuration.zitadel.issuer}/.well-known/openid-configuration`,
      clientId: configuration.zitadel.clientId,
    },
  ],
};
