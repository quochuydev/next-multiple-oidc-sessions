"use client";
import { useEffect, useState } from "react";

export default function Home({ returnUrl }: { returnUrl: string }) {
  useEffect(() => {
    fetch(`https://auth.example.local/api/signin?returnUrl=${returnUrl}`, {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.authorizeUrl) {
          window.location.href = data.authorizeUrl;
        }
      });
  }, [returnUrl]);

  return <div>Loading...</div>;
}
