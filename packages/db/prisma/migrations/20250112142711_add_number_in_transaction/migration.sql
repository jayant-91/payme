/*
  Warnings:

  - Added the required column `fromNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fromNumber" TEXT NOT NULL,
ADD COLUMN     "toNumber" TEXT NOT NULL;
