-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "showOnHome" BOOLEAN NOT NULL DEFAULT true;
