"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOut(props: {
  returnUrl?: string;
  sessionId?: string;
}) {
  const { returnUrl, sessionId } = props;
  const router = useRouter();

  useEffect(() => {
    fetch(`https://auth.example.local/api/auth/signout`, {
      method: "POST",
      body: JSON.stringify({
        returnUrl,
        sessionId,
      }),
    })
      .then((response) => response.json())
      .then(({ endSessionUrl }) => {
        if (endSessionUrl) router.replace(endSessionUrl);
      });
  }, [returnUrl, router, sessionId]);

  return <div>Loading...</div>;
}
