"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    reloadSessions();
  }, []);

  function reloadSessions() {
    fetch("https://auth.example.local/api/v1/sessions", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => (data.sessions ? data.sessions : []))
      .then((data) => setSessions(data));
  }

  return (
    <div>
      <button
        onClick={() => {
          const params = new URLSearchParams({
            prompt: "select_account",
            scope: [
              "openid",
              "userinfo",
              "email",
              "profile",
              "address",
              "offline_access",
              "urn:zitadel:iam:user:resourceowner",
              "urn:zitadel:iam:org:project:id:zitadel:aud",
            ].join(" "),
            return_url: "https://app.example.local/app2",
          });

          window.location.href = `https://auth.example.local/auth/signin/portal?${params}`;
        }}
      >
        Login
      </button>
      <button
        onClick={async () => {
          const params = new URLSearchParams({
            return_url: "https://app.example.local/app2",
          });

          if (sessions[0]?.idToken) {
            params.set("id_token_hint", sessions[0].idToken);
          }

          window.location.href = `https://auth.example.local/auth/signout/portal?${params}`;
        }}
      >
        Logout
      </button>
      <pre className="json-output" style={{ maxWidth: 1200 }}>
        <p>{JSON.stringify(sessions, null, 2)}</p>
      </pre>
    </div>
  );
}
