-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "personalizationImageUrl" TEXT,
ADD COLUMN     "personalizationText" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isPersonalizable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personalizationImageEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "personalizationTextEnabled" BOOLEAN NOT NULL DEFAULT false;
