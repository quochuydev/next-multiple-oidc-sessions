import SignIn from "@/ui/SignIn";

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
    <SignIn
      returnUrl={searchParams.return_url}
      prompt={searchParams.prompt}
      scope={searchParams.scope}
      loginHint={searchParams.login_hint}
    />
  );
}
