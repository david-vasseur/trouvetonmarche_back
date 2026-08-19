-- CreateEnum
CREATE TYPE "ElectricityOption" AS ENUM ('NONE', 'INCLUDED', 'PAID');

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "electricity" "ElectricityOption" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "exhibitors" INTEGER,
ADD COLUMN     "registrationsOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "standSizes" TEXT[];
