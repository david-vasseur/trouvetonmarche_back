/*
  Warnings:

  - You are about to drop the column `date` on the `Market` table. All the data in the column will be lost.
  - You are about to drop the column `marketId` on the `User` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endAt` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('NONE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "PromotionTargetType" AS ENUM ('FRANCE', 'REGION', 'DEPARTMENT', 'CITY', 'RADIUS');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('COVERED', 'EXTERIOR', 'BOTH');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_marketId_fkey";

-- AlterTable
ALTER TABLE "Market" DROP COLUMN "date",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "endAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "history" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "marketType" "MarketType" NOT NULL DEFAULT 'EXTERIOR',
ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "recurrence" "Recurrence" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "standPrice" DECIMAL(65,30),
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visitors" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "marketId";

-- CreateTable
CREATE TABLE "MarketOpeningHour" (
    "id" SERIAL NOT NULL,
    "marketId" INTEGER NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "openAt" TEXT NOT NULL,
    "closeAt" TEXT NOT NULL,

    CONSTRAINT "MarketOpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "targetType" "PromotionTargetType" NOT NULL,
    "regionCode" TEXT,
    "departmentCode" TEXT,
    "cityCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radiusKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketOpeningHour_marketId_idx" ON "MarketOpeningHour"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Promotion_userId_idx" ON "Promotion"("userId");

-- CreateIndex
CREATE INDEX "Promotion_marketId_idx" ON "Promotion"("marketId");

-- CreateIndex
CREATE INDEX "Promotion_startAt_endAt_idx" ON "Promotion"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "Market_cityCode_startAt_idx" ON "Market"("cityCode", "startAt");

-- CreateIndex
CREATE INDEX "Market_departmentCode_startAt_idx" ON "Market"("departmentCode", "startAt");

-- CreateIndex
CREATE INDEX "Market_regionCode_startAt_idx" ON "Market"("regionCode", "startAt");

-- CreateIndex
CREATE INDEX "Market_startAt_id_idx" ON "Market"("startAt", "id");

-- CreateIndex
CREATE INDEX "Market_userId_idx" ON "Market"("userId");

-- CreateIndex
CREATE INDEX "Market_categoryId_idx" ON "Market"("categoryId");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketOpeningHour" ADD CONSTRAINT "MarketOpeningHour_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
