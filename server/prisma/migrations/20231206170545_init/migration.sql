-- AlterTable
ALTER TABLE `users` MODIFY `resetToken` VARCHAR(191) NULL,
    MODIFY `resetTokenExpiration` DATE NULL;
