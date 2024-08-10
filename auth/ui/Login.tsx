"use client";
import { useEffect } from "react";

export default function Home({ returnUrl }: { returnUrl: string }) {
  useEffect(() => {
    fetch(`https://auth.example.local/api/csrf`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.csrfToken) {
          fetch(`https://auth.example.local/api/signin`, {
            method: "POST",
            body: JSON.stringify({
              csrfToken: data.csrfToken,
              returnUrl,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.authorizeUrl) {
                window.location.href = data.authorizeUrl;
              }
            });
        }
      });
  }, [returnUrl]);

  return <div>Loading...</div>;
}
