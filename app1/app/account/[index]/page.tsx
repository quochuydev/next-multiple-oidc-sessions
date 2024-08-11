import Home from "@/ui/Home";
import { headers } from "next/headers";

export default async function Page() {
  const sessions = await fetch("https://auth.example.local/api/v1/sessions", {
    method: "GET",
    credentials: "include",
    cache: "no-cache",
    headers: {
      cookie: headers().get("cookie") as string,
    },
  }).then((response) => response.json());

  return <Home />;
}
