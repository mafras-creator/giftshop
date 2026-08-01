import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Birthday Gifts", slug: "birthday-gifts", emoji: "🎉", displayOrder: 1 },
  { name: "Anniversary Gifts", slug: "anniversary-gifts", emoji: "💍", displayOrder: 2 },
  { name: "Personalized Gifts", slug: "personalized-gifts", emoji: "🖼️", displayOrder: 3 },
  { name: "Flowers & Cakes", slug: "flowers-cakes", emoji: "💐", displayOrder: 4 },
  { name: "Gifts for Her", slug: "gifts-for-her", emoji: "❤️", displayOrder: 5 },
  { name: "Gifts for Him", slug: "gifts-for-him", emoji: "🎩", displayOrder: 6 },
  { name: "Corporate Gifts", slug: "corporate-gifts", emoji: "🎓", displayOrder: 7 },
];

const products = [
  { name: "Personalized Photo Mug", slug: "personalized-photo-mug", categorySlug: "personalized-gifts", price: 12.99, stock: 60, seed: "mug1", description: "A custom-printed ceramic mug featuring your favorite photo. Dishwasher safe and microwave friendly." },
  { name: "Engraved Wooden Watch", slug: "engraved-wooden-watch", categorySlug: "gifts-for-him", price: 45.0, stock: 25, seed: "watch1", description: "A handcrafted wooden watch with a custom engraved message on the back." },
  { name: "Fresh Rose Bouquet", slug: "fresh-rose-bouquet", categorySlug: "flowers-cakes", price: 34.5, stock: 40, seed: "roses1", description: "A dozen fresh red roses, hand-tied with eucalyptus and delivered same-day." },
  { name: "Chocolate Truffle Cake", slug: "chocolate-truffle-cake", categorySlug: "flowers-cakes", price: 28.0, stock: 30, seed: "cake1", description: "Rich chocolate truffle cake, 1kg, baked fresh and delivered same-day." },
  { name: "Scented Candle Set", slug: "scented-candle-set", categorySlug: "gifts-for-her", price: 22.5, stock: 50, seed: "candle1", description: "A set of 3 hand-poured soy candles in lavender, vanilla, and sandalwood." },
  { name: "Custom Name Necklace", slug: "custom-name-necklace", categorySlug: "gifts-for-her", price: 29.99, stock: 35, seed: "necklace1", description: "A delicate gold-plated necklace personalized with any name or word." },
  { name: "Birthday Balloon Bouquet", slug: "birthday-balloon-bouquet", categorySlug: "birthday-gifts", price: 18.0, stock: 45, seed: "balloons1", description: "A festive bunch of helium balloons to make any birthday feel special." },
  { name: "Couple Photo Frame", slug: "couple-photo-frame", categorySlug: "anniversary-gifts", price: 24.99, stock: 30, seed: "frame1", description: "A elegant wooden photo frame designed for couples, holds 3 photos." },
  { name: "Leather Wallet", slug: "leather-wallet", categorySlug: "gifts-for-him", price: 32.0, stock: 40, seed: "wallet1", description: "A genuine leather bifold wallet with card slots and a coin pocket." },
  { name: "Desk Organizer Set", slug: "desk-organizer-set", categorySlug: "corporate-gifts", price: 19.99, stock: 60, seed: "desk1", description: "A minimalist wooden desk organizer, great for office gifting." },
  { name: "Anniversary Wine Hamper", slug: "anniversary-wine-hamper", categorySlug: "anniversary-gifts", price: 55.0, stock: 20, seed: "wine1", description: "A curated hamper with wine, chocolates, and a handwritten card." },
  { name: "Custom Portrait Print", slug: "custom-portrait-print", categorySlug: "personalized-gifts", price: 38.0, stock: 20, seed: "portrait1", description: "A hand-illustrated custom portrait printed on premium matte paper." },
];

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@giftshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@giftshop.com",
      passwordHash: await bcrypt.hash("Admin123!", 10),
      role: "ADMIN",
    },
  });

  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { emoji: c.emoji, displayOrder: c.displayOrder },
      create: { name: c.name, slug: c.slug, emoji: c.emoji, displayOrder: c.displayOrder },
    });
    categoryMap[c.slug] = created.id;
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId: categoryMap[p.categorySlug],
        images: { create: [{ url: `https://picsum.photos/seed/${p.seed}/600/600` }] },
      },
    });
  }

  console.log("Seeded. Admin login: admin@giftshop.com / Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
