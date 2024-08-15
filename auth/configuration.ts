import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import * as z from "zod";

if (process.env.ENV_PATH) {
  const envPath = path.join(process.cwd(), process.env.ENV_PATH);
  const buffer = fs.readFileSync(envPath);
  const defaultConfig = dotenv.parse(buffer);

  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (!process.env[key]) process.env[key] = value;
  });
}

const schema = z.object({
  appUrl: z.string(),
  domain: z.string(),
  originRegex: z.unknown(),
  cookie: z.object({
    httpOnly: z.boolean(),
    secure: z.boolean(),
  }),
  portal: z.object({
    clientId: z.string(),
    issuer: z.string(),
    redirectUrl: z.string(),
  }),
});

const configuration = {
  appUrl: "https://auth.example.local",
  domain: "example.local",
  originRegex: /^(.*\.)?(example\.local|real-domain\.com)$/,
  cookie: {
    httpOnly: true,
    secure: true,
  },
  portal: {
    issuer: "https://zitadel-login-ui-v2.vercel.app",
    clientId: "279716137237868517",
  },
  zitadel: {
    issuer: "https://system-v1-fpms4l.zitadel.cloud",
    clientId: "279716137237868517",
  },
  redirectUrl: "https://auth.example.local/api/auth/callback",
  postLogoutRedirectUri: "https://auth.example.local/auth/signedout",
};

try {
  console.log(`debug:configuration`, configuration);
  schema.parse(configuration);
} catch (error) {
  console.error("Bad configuration.", error);
  throw error;
}

export default configuration;
