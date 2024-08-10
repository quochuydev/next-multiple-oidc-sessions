import crypto from "crypto";

export const generateCodeVerifier = () =>
  crypto.randomBytes(32).toString("hex");

export const generateCodeChallenge = (codeVerifier: string) =>
  base64URLEncode(crypto.createHash("sha256").update(codeVerifier).digest());

export function generateState(): string {
  return crypto.randomBytes(16).toString("hex");
}

function base64URLEncode(str: Buffer) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
