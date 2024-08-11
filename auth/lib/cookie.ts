import configuration from "@/configuration";
import { cookies } from "next/headers";

export const setAuthSessionCookie = (name: string, value: string) => {
  const requestCookie = cookies();

  requestCookie.set({
    name,
    value,
    sameSite: "lax",
    path: "/",
    domain: configuration.domain,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 30 * 24 * 60 * 60, // 30d
  });
};

export const setShortLiveCookie = (name: string, value: string) => {
  const requestCookie = cookies();

  requestCookie.set({
    name,
    value,
    sameSite: "lax",
    path: "/",
    domain: new URL(configuration.appUrl).hostname,
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
    maxAge: 5 * 60, // 5m
  });
};

export const deleteCookie = (name: string) => {
  const requestCookie = cookies();

  requestCookie.set({
    name,
    value: "",
    domain: new URL(configuration.appUrl).hostname,
    maxAge: 0,
    sameSite: "strict",
    path: "/",
    httpOnly: configuration.cookie.httpOnly,
    secure: configuration.cookie.secure,
  });
};
