export type APIGetSessions = {
  url: "/api/sessions";
  method: "get";
  data: {
    sessions: Array<{
      id: string;
      sessionId: string;
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
