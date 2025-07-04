/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `profileFormat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePublicId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileVersion` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "avatarUrl",
ADD COLUMN     "profileFormat" TEXT,
ADD COLUMN     "profilePublicId" TEXT,
ADD COLUMN     "profileVersion" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileFormat",
DROP COLUMN "profilePublicId",
DROP COLUMN "profileVersion";
