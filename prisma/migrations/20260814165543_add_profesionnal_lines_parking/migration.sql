-- CreateEnum
CREATE TYPE "BarnumRequirement" AS ENUM ('REQUIRED', 'FORBIDDEN', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "ParkingAvailability" AS ENUM ('NEARBY', 'FAR', 'NONE');

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "barnum" "BarnumRequirement" NOT NULL DEFAULT 'OPTIONAL',
ADD COLUMN     "parkingAvailability" "ParkingAvailability" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "parkingFree" BOOLEAN NOT NULL DEFAULT false;
