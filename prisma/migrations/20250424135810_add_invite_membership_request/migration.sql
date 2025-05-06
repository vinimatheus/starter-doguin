-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "MembershipRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipRequest_organizationId_idx" ON "MembershipRequest"("organizationId");

-- CreateIndex
CREATE INDEX "MembershipRequest_userId_idx" ON "MembershipRequest"("userId");

-- CreateIndex
CREATE INDEX "MembershipRequest_status_idx" ON "MembershipRequest"("status");

-- AddForeignKey
ALTER TABLE "MembershipRequest" ADD CONSTRAINT "MembershipRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRequest" ADD CONSTRAINT "MembershipRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
