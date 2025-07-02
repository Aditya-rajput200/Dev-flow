/*
  Warnings:

  - You are about to drop the column `avatarImg` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarImg",
ADD COLUMN     "profileFormat" TEXT,
ADD COLUMN     "profilePublicId" TEXT,
ADD COLUMN     "profileVersion" TEXT;
