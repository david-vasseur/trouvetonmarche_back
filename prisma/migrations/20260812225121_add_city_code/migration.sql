/*
  Warnings:

  - You are about to drop the column `state` on the `Market` table. All the data in the column will be lost.
  - Added the required column `cityCode` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentCode` to the `Market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionCode` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Market" DROP COLUMN "state",
ADD COLUMN     "cityCode" TEXT NOT NULL,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "departmentCode" TEXT NOT NULL,
ADD COLUMN     "regionCode" TEXT NOT NULL;
