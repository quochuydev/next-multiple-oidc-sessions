/* eslint-disable max-len */
"use client";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ProfileImage(props: {
  session: any;
  sessions: any[];
  onSelectAccount: (session: any) => void;
  signOut: (sessionId: string) => void;
}) {
  const { session, sessions, onSelectAccount, signOut } = props;

  const user = {
    loginName: session?.userId,
    displayName: session?.userId,
    orgId: session?.userId,
    userId: session?.userId,
  };

  return (
    <Menu as="div" className="relative inline-block">
      <div>
        {user.loginName}
        <Menu.Button className="items-center justify-center ml-4 transition-all h-8 w-8 rounded-full shadow-lg ring-2 ring-opacity-50">
          <span className="text-sm">
            {user && user.loginName ? user.loginName.substring(0, 1) : "A"}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute w-80 right-0 mt-3 origin-top-right divide-y divide-gray-500 rounded-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-white">
          <div className="flex flex-col items-center py-4 px-1">
            <p>{user.loginName}</p>
            <p className="text-sm">{user.displayName}</p>
          </div>

          {sessions?.map((session, i: number) => (
            <Menu.Item key={session?.userId}>
              {() => (
                <button
                  onClick={() => onSelectAccount(session)}
                  className={`group flex items-center w-full px-2 py-2 text-sm`}
                >
                  <div className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-black bg-opacity-20">
                    <span className="text-sm">
                      {session ? session.userId?.substring(0, 1) : "A"}
                    </span>
                  </div>

                  <div className="flex flex-col justify-star text-left">
                    <span>{session?.userId}</span>
                    <span className="text-xs">{session?.userId}</span>
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}

          <Menu.Item>
            {() => (
              <button
                className={`group flex justify-center items-center w-full px-2 py-2 text-sm`}
                onClick={() => {
                  const params = new URLSearchParams({
                    // login_hint: 'username',
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
                    return_url: "https://app.example.local/app1",
                  });

                  window.location.href = `https://auth.example.local/login?${params.toString()}`;
                }}
              >
                + Add other account
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {() => (
              <button
                className={`group flex justify-center items-center w-full px-2 py-2 text-sm`}
                onClick={() => signOut(session.id)}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}