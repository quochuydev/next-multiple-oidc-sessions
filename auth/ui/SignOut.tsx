"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOut(props: { returnUrl?: string }) {
  const { returnUrl } = props;
  const router = useRouter();

  useEffect(() => {
    fetch(`https://auth.example.local/api/auth/signout`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then(async (data) => {
        console.log(`debug:data`, data);
      });
  }, [returnUrl, router]);

  return <div>Loading...</div>;
}
