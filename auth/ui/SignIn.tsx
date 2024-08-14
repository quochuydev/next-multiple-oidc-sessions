"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignIn(props: {
  returnUrl?: string;
  prompt?: string;
  scope?: string;
  loginHint?: string;
}) {
  const router = useRouter();
  const { returnUrl, prompt, scope, loginHint } = props;

  useEffect(() => {
    fetch(`https://auth.example.local/api/auth/csrf`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then(async ({ csrfToken }) => {
        if (csrfToken) {
          const result = await fetch(
            `https://auth.example.local/api/auth/signin`,
            {
              method: "POST",
              body: JSON.stringify({
                csrfToken,
                returnUrl,
                prompt,
                scope,
                loginHint,
              }),
            }
          ).then((response) => response.json());

          if (result.authorizeUrl) router.replace(result.authorizeUrl);
        }
      });
  }, [loginHint, prompt, returnUrl, router, scope]);

  return <div>Loading...</div>;
}
