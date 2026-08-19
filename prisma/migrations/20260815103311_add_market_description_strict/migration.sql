/*
  Warnings:

  - Made the column `excerpt` on table `Market` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Market` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "excerpt" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
