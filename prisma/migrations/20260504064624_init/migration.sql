-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('FOUND', 'MATCHED', 'READY_FOR_REVIEW', 'APPROVED', 'APPLIED', 'SEEN', 'REPLIED', 'INTERVIEW', 'REJECTED', 'ERROR', 'SKIPPED', 'BLACKLISTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetRolesJson" JSONB NOT NULL,
    "skillsJson" JSONB NOT NULL,
    "locationsJson" JSONB NOT NULL,
    "minStipend" INTEGER,
    "dailyLimit" INTEGER NOT NULL DEFAULT 5,
    "minMatchScore" INTEGER NOT NULL DEFAULT 80,
    "avoidKeywordsJson" JSONB NOT NULL,
    "blockedCompaniesJson" JSONB NOT NULL,
    "remoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "avoidUnpaid" BOOLEAN NOT NULL DEFAULT true,
    "autopilotEnabled" BOOLEAN NOT NULL DEFAULT false,
    "manualApproval" BOOLEAN NOT NULL DEFAULT true,
    "scheduleTime" TEXT NOT NULL DEFAULT '09:00',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalFileUrl" TEXT NOT NULL,
    "parsedText" TEXT,
    "skillsJson" JSONB,
    "roleCategory" TEXT,
    "pageCount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedResume" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "htmlContent" TEXT,
    "pageCount" INTEGER NOT NULL,
    "validationJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'internshala',
    "companyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "stipend" TEXT,
    "duration" TEXT,
    "skillsJson" JSONB,
    "description" TEXT,
    "jobUrl" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "sourceHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "resumeId" TEXT,
    "matchScore" INTEGER NOT NULL,
    "scoreBreakdownJson" JSONB,
    "selectedAnswersJson" JSONB,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'FOUND',
    "appliedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "replyStatus" TEXT,
    "replySummary" TEXT,
    "screenshotUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "appliedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "logsJson" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramNotificationConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramBotTokenEnc" TEXT,
    "telegramChatIdEnc" TEXT,
    "dailySummary" BOOLEAN NOT NULL DEFAULT true,
    "instantApplicationAlerts" BOOLEAN NOT NULL DEFAULT false,
    "instantReplyAlerts" BOOLEAN NOT NULL DEFAULT true,
    "errorAlerts" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TelegramNotificationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPost_userId_jobUrl_key" ON "JobPost"("userId", "jobUrl");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramNotificationConfig_userId_key" ON "TelegramNotificationConfig"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramNotificationConfig" ADD CONSTRAINT "TelegramNotificationConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
