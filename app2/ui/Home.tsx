"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    console.log("App1 loaded");

    fetch("https://auth.example.local/api/v1/sessions", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => (data.sessions ? data.sessions : []))
      .then((data) => setSessions(data));
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          window.location.href =
            "https://auth.example.local/login?returnUrl=https://app1.example.local";
        }}
      >
        Login
      </button>

      <pre
        style={{ textWrap: "wrap", maxWidth: 1200, overflowWrap: "break-word" }}
      >
        <p>{JSON.stringify(sessions, null, 2)}</p>
      </pre>
    </div>
  );
}
