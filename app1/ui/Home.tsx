"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    console.log("App1 loaded");
  }, []);

  return (
    <button
      onClick={() => {
        window.location.href =
          "http://localhost:3000/login?returnUrl=http://localhost:3001";
      }}
    >
      Login
    </button>
  );
}
