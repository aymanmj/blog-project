/*
  Warnings:

  - You are about to drop the column `userStuts` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `posts` MODIFY `postStatus` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `published` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `userStuts`,
    ADD COLUMN `userStatus` BOOLEAN NOT NULL DEFAULT true;
