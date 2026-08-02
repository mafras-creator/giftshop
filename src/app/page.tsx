import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import HeroCarousel from "@/components/HeroCarousel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  Truck,
  Moon,
  Gift as GiftIcon,
  Briefcase,
  Globe,
  Crown,
  Flower2,
  CakeSlice,
} from "lucide-react";

const services = [
  { label: "Same Day Delivery", icon: Truck },
  { label: "Midnight Delivery", icon: Moon },
  { label: "Personalized Gifts", icon: GiftIcon },
  { label: "Corporate Gifts", icon: Briefcase },
  { label: "International Delivery", icon: Globe },
  { label: "Luxury Collection", icon: Crown },
  { label: "Fresh Flowers", icon: Flower2 },
  { label: "Premium Cakes", icon: CakeSlice },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [bestsellers, homeCategories, banners, wishlistItems] = await Promise.all([
    prisma.product.findMany({
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { showOnHome: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
    }),
    session
      ? prisma.wishlistItem.findMany({
          where: { userId: (session.user as any).id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const wishlistedIds = new Set(wishlistItems.map((w) => w.productId));

  const trending = [...bestsellers].reverse();

  // Fall back to one default slide if the admin hasn't added any banners yet,
  // so the homepage never looks broken on a fresh install.
  const heroSlides =
    banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          imageUrl: b.imageUrl,
          mobileImageUrl: b.mobileImageUrl,
          title: b.title,
          subtitle: b.subtitle,
          buttonText: b.buttonText,
          linkUrl: b.linkUrl,
        }))
      : [
          {
            id: "default",
            imageUrl: "https://picsum.photos/seed/luxuryhero/1600/700",
            mobileImageUrl: "https://picsum.photos/seed/luxuryheromobile/800/900",
            title: "Gifts that feel like magic.",
            subtitle: "Curated, premium gifts for every celebration — delivered with care.",
            buttonText: "Shop Now",
            linkUrl: "/shop",
          },
        ];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <HeroCarousel slides={heroSlides} />

      {/* Services row */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {services.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 h-[90px] rounded-[18px] border border-gray-100 shadow-soft hover:border-brand-300 hover:shadow-soft-lg transition-all duration-250 cursor-pointer text-center px-2"
            >
              <Icon size={18} className="text-brand-600" />
              <p className="text-[11px] font-medium text-gray-600 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <p className="text-gray-500 text-sm mt-1">Find the perfect gift, beautifully organized</p>
        </div>
        <CategoryGrid categories={homeCategories} />
      </section>

      {/* Trending */}
      <ProductRail
        title="Trending Gifts"
        subtitle="What everyone's adding to their cart right now"
        products={trending}
        badge="Trending"
        wishlistedIds={wishlistedIds}
      />

      {/* Promotional banner */}
      <section className="relative rounded-card overflow-hidden min-h-[280px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/birthdaypromo/1400/500"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-800/85 via-brand-700/70 to-transparent" />
        </div>
        <div className="relative px-8 md:px-14 py-12 max-w-lg">
          <p className="text-brand-100 text-sm font-semibold uppercase tracking-wide mb-2">
            Limited Time
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Birthday Special</h2>
          <p className="text-brand-100 mb-6">
            Up to 30% off curated birthday collections — today only.
          </p>
          <Link
            href="/shop?category=birthday-gifts"
            className="inline-block bg-accent-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-600 transition"
          >
            Shop the Offer
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      <ProductRail
        title="Best Sellers"
        subtitle="Loved by thousands of happy customers"
        products={bestsellers}
        badge="Best Seller"
        wishlistedIds={wishlistedIds}
      />

      {/* Newsletter */}
      <section className="bg-gradient-to-br from-brand-50 to-white rounded-card p-10 md:p-16 text-center border border-brand-100">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Never miss a gifting moment</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Get reminders for birthdays and anniversaries, plus early access to seasonal collections.
        </p>
        <form className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="border border-gray-200 rounded-xl px-4 py-3 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button
            type="button"
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}

function ProductRail({
  title,
  subtitle,
  products,
  badge,
  wishlistedIds,
}: {
  title: string;
  subtitle: string;
  products: Awaited<ReturnType<typeof prisma.product.findMany>>;
  badge?: "Trending" | "Best Seller" | "New" | "Selling Fast" | "Limited Stock";
  wishlistedIds: Set<string>;
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:text-brand-700 shrink-0">
          View All
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {products.map((product: any, i: number) => (
          <div key={product.id} className="w-[220px] md:w-[260px] shrink-0">
            <ProductCard
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price.toString()}
              imageUrl={product.images[0]?.url}
              categoryName={product.category.name}
              badge={i === 0 ? badge : undefined}
              isPersonalizable={product.isPersonalizable}
              isWishlisted={wishlistedIds.has(product.id)}
            />
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-gray-400 py-10">No products yet — add some from the admin dashboard.</p>
        )}
      </div>
    </section>
  );
}
