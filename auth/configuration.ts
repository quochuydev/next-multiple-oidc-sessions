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
  cookie: z.object({
    domain: z.string(),
    sameSite: z.string(),
    path: z.string(),
    httpOnly: z.boolean(),
    secure: z.boolean(),
    maxAge: z.number(),
  }),
  zitadel: z.object({
    url: z.string(),
  }),
  portal: z.object({
    clientId: z.string(),
    issuer: z.string(),
    redirectUrl: z.string(),
  }),
});

const configuration = {
  appUrl: "https://auth.example.local",
  cookie: {
    domain: "example.local",
    sameSite: "lax" as "lax" | "strict" | "none",
    path: "/",
    httpOnly: true,
    secure: false,
    maxAge: 30 * 24 * 60 * 60, // 30d
  },
  zitadel: {
    url: "https://system-v1-fpms4l.zitadel.cloud",
  },
  portal: {
    clientId: "279716137237868517",
    // issuer: "https://zitadel-login-ui-v2.vercel.app",
    issuer: "https://system-v1-fpms4l.zitadel.cloud",
    redirectUrl: "https://auth.example.local/api/callback",
  },
};

try {
  console.log(`debug:configuration`, configuration);
  schema.parse(configuration);
} catch (error) {
  console.error("Bad configuration.", error);
  throw error;
}

export default configuration;
