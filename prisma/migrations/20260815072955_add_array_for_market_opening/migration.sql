/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `MarketOpeningHour` table. All the data in the column will be lost.
  - Added the required column `date` to the `MarketOpeningHour` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MarketOpeningHour_marketId_idx";

-- AlterTable
ALTER TABLE "MarketOpeningHour" DROP COLUMN "dayOfWeek",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "MarketOpeningHour_marketId_date_idx" ON "MarketOpeningHour"("marketId", "date");
