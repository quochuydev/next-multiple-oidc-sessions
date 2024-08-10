import crypto from "crypto";

// export const codeVerifier = crypto.randomBytes(32).toString("hex");
// console.log("Code Verifier:", codeVerifier);

// export const codeChallenge = base64URLEncode(
//   crypto.createHash("sha256").update(codeVerifier).digest()
// );
// console.log(`debug:codeChallenge`, codeChallenge);

export const codeVerifier =
  "c27cbea681d119b0727811b47d82c3cca5f41f5c4963ec4b3be09bd1d003ba9e";
export const codeChallenge = "ZLMp6xW_t60xwUnN7j5Kx0LPR5Qo6N2pqcA7Et7GfNY";

function base64URLEncode(str: Buffer) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
