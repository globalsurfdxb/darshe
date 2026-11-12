-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answers" JSONB NOT NULL,
    "firstName" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "contactConsent" BOOLEAN,
    "source" TEXT,
    "ipHash" TEXT
);

-- CreateIndex
CREATE INDEX "SurveyResponse_createdAt_idx" ON "SurveyResponse"("createdAt");
