-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "accessToken" TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
