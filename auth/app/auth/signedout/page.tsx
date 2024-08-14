import configuration from "@/configuration";
import { returnUrlCookieName } from "@/lib/constant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: {} }) {
  console.log(`debug:searchParams`, searchParams);
  const requestCookie = cookies();
  const returnUrlCookie = requestCookie.get(returnUrlCookieName);
  const redirectUrl = returnUrlCookie?.value || configuration.appUrl;
  return redirect(redirectUrl);
}