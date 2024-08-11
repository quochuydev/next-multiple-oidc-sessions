"use client";
import { useEffect, useState } from "react";
import ProfileImage from "./components/ProfileImage";

export default function Home() {
  const [sessions, setSessions] = useState([]);

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
    <div className="flex flex-col">
      <div className="relative">
        <nav aria-label="Top" className="flex items-center mx-auto">
          <div className="ml-auto h-16 flex items-center px-8">
            <ProfileImage
              appUrl={""}
              onSelectAccount={(session) => console.log(session)}
              session={sessions[0]}
              sessions={sessions}
              onLogout={() => {
                fetch("https://auth.example.local/api/v1/signout", {
                  method: "post",
                  credentials: "include",
                  body: JSON.stringify({
                    sessionId: "",
                  }),
                })
                  .then((response) => response.json())
                  .then((data) => console.log(data));

                reloadSessions();
              }}
            />
          </div>
        </nav>
      </div>

      <pre className="json-output" style={{ maxWidth: 1200 }}>
        <p>{JSON.stringify(sessions, null, 2)}</p>
      </pre>
    </div>
  );
}
