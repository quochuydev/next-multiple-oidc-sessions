export type APIGetSessions = {
  url: "/api/sessions";
  method: "get";
  data: {
    sessions: Array<{
      id: string;
      authSession: string;
      userId: string | null;
      accessToken: string;
      tokenType: string;
      expiresIn: number;
      refreshToken: string | null;
      idToken: string | null;
      createdAt: Date;
    }>;
  };
};

export type APISignOut = {
  url: "/api/v1/signout";
  method: "post";
  data: {
    sessionId: string;
  };
};
