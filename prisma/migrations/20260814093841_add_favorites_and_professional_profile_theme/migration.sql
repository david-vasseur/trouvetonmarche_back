/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProfessionalProfile_city_idx";

-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "activityTypeId" INTEGER,
ADD COLUMN     "cityCode" TEXT,
ADD COLUMN     "departmentCode" TEXT,
ADD COLUMN     "regionCode" TEXT,
ADD COLUMN     "themeId" INTEGER;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalTag" (
    "profileId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "ProfessionalTag_pkey" PRIMARY KEY ("profileId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_name_key" ON "ActivityType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_slug_key" ON "ActivityType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");

-- CreateIndex
CREATE INDEX "ProfessionalTag_tagId_idx" ON "ProfessionalTag"("tagId");

-- CreateIndex
CREATE INDEX "ProfessionalTag_profileId_idx" ON "ProfessionalTag"("profileId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_cityCode_idx" ON "ProfessionalProfile"("cityCode");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_departmentCode_idx" ON "ProfessionalProfile"("departmentCode");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_regionCode_idx" ON "ProfessionalProfile"("regionCode");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_activityTypeId_idx" ON "ProfessionalProfile"("activityTypeId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_themeId_idx" ON "ProfessionalProfile"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "ActivityType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalTag" ADD CONSTRAINT "ProfessionalTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ProfessionalProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalTag" ADD CONSTRAINT "ProfessionalTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
