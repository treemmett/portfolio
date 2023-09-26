/*
  Warnings:

  - Made the column `photoId` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "sites_favicons_photos" DROP CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "photoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "sites_favicons_photos" ADD CONSTRAINT "FK_644cbd25b5502c11c9a4f4c37a4" FOREIGN KEY ("sitesId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
