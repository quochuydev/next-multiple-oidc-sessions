"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch("https://auth.example.local/api/v1/sessions", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => (data.sessions ? data.sessions : []))
      .then((data) => setSessions(data));
  }, []);

  return (
    <div>
      <pre
        style={{ textWrap: "wrap", maxWidth: 1200, overflowWrap: "break-word" }}
      >
        <p>{JSON.stringify(sessions, null, 2)}</p>
      </pre>
    </div>
  );
}
