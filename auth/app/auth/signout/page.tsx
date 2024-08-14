import SignOut from "@/ui/SignOut";

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
  return <SignOut returnUrl={searchParams.return_url} />;
}
