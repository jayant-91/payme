/*
  Warnings:

  - A unique constraint covering the columns `[balanceId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balanceId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_balanceId_key" ON "User"("balanceId");
