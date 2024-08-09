import configuration from "@/configuration";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export function setCookie(
  name: string,
  value: string,
  options?: Partial<ResponseCookie>
) {
  const requestCookie = cookies();

  console.log(`debug:hostname`, new URL(configuration.appUrl).hostname);

  const defaultOptions: Partial<ResponseCookie> = {
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: false, // TODO: set to true
    maxAge: 30 * 24 * 60 * 60, // 30d
    domain: "example.local",
  };

  requestCookie.set({
    name,
    value,
    ...defaultOptions,
    ...options,
  });
}
