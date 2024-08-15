import SignIn from "@/ui/SignIn";

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: {
    return_url?: string;
    prompt?: string;
    scope?: string;
    login_hint?: string;
  };
  params: { provider: string };
}) {
  return (
    <SignIn
      provider={params.provider}
      returnUrl={searchParams.return_url}
      prompt={searchParams.prompt}
      scope={searchParams.scope}
      loginHint={searchParams.login_hint}
    />
  );
}
