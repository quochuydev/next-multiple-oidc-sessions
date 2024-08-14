"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOut(props: {
  returnUrl?: string;
  idTokenHint?: string;
  clientId?: string;
  postLogoutRedirectUri?: string;
  state?: string;
}) {
  const { returnUrl, idTokenHint, clientId, postLogoutRedirectUri, state } =
    props;
  const router = useRouter();

  useEffect(() => {
    fetch(`https://auth.example.local/api/auth/signout`, {
      method: "POST",
      body: JSON.stringify({
        returnUrl,
        idTokenHint,
        clientId,
        postLogoutRedirectUri,
        state,
      }),
    })
      .then((response) => response.json())
      .then(({ endSessionUrl }) => {
        if (endSessionUrl) router.replace(endSessionUrl);
      });
  }, [clientId, idTokenHint, postLogoutRedirectUri, returnUrl, router, state]);

  return <div>Loading...</div>;
}
