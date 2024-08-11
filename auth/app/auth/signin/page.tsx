import Login from "@/ui/Login";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    return_url?: string;
    prompt?: string;
    scope?: string;
    login_hint?: string;
  };
}) {
  return (
    <Login
      returnUrl={searchParams.return_url}
      prompt={searchParams.prompt}
      scope={searchParams.scope}
      loginHint={searchParams.login_hint}
    />
  );
}
