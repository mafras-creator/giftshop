-- CreateTable
CREATE TABLE "BottomNavItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "emoji" TEXT,
    "imageUrl" TEXT,
    "href" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BottomNavItem_pkey" PRIMARY KEY ("id")
);

-- Seed sensible defaults so the bottom nav isn't empty out of the box
INSERT INTO "BottomNavItem" ("id", "label", "emoji", "href", "displayOrder", "active") VALUES
  ('bottomnav_home', 'Home', '🏠', '/', 0, true),
  ('bottomnav_categories', 'Categories', '▦', '/shop', 1, true),
  ('bottomnav_offers', 'Offers', '🏷️', '/shop', 2, true),
  ('bottomnav_account', 'Account', '👤', '/account', 3, true);
