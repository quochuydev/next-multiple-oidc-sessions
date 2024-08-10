import crypto from "crypto";

export const codeVerifier = crypto.randomBytes(32).toString("hex");
console.log("Code Verifier:", codeVerifier);

export const codeChallenge = base64URLEncode(
  crypto.createHash("sha256").update(codeVerifier).digest()
);

function base64URLEncode(str: Buffer) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
