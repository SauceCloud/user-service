-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE CITEXT;

-- RenameIndex
ALTER INDEX "users_email_key" RENAME TO "uq_user_username";

-- RenameIndex
ALTER INDEX "users_username_key" RENAME TO "uq_user_email";
