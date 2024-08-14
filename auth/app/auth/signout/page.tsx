import SignOut from "@/ui/SignOut";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    return_url?: string;
    id_token_hint?: string;
    client_id?: string;
    post_logoutRedirect_uri?: string;
    state?: string;
  };
}) {
  return (
    <SignOut
      returnUrl={searchParams.return_url}
      idTokenHint={searchParams.id_token_hint}
      clientId={searchParams.client_id}
      postLogoutRedirectUri={searchParams.post_logoutRedirect_uri}
      state={searchParams.state}
    />
  );
}
