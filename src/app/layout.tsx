import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TopCategoryBar from "@/components/TopCategoryBar";
import SiteFooter from "@/components/SiteFooter";
import AccountDrawer from "@/components/AccountDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "Zepzo | Perfect Gifts for Every Occasion",
  description: "Zepzo — a modern gift-selling e-commerce platform for Sri Lanka",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  let cartCount = 0;
  let wishlistCount = 0;
  if (session) {
    const userId = (session.user as any).id as string;
    const [cartAgg, wishlistCountResult] = await Promise.all([
      prisma.cartItem.aggregate({ _sum: { quantity: true }, where: { userId } }),
      prisma.wishlistItem.count({ where: { userId } }),
    ]);
    cartCount = cartAgg._sum.quantity ?? 0;
    wishlistCount = wishlistCountResult;
  }

  const topBarCategories = await prisma.category.findMany({
    where: { showInTopBar: true },
    orderBy: { topBarOrder: "asc" },
  });

  const bottomNavItems = await prisma.bottomNavItem.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-4 py-4">
              <Link href="/" className="text-xl font-bold text-brand-600 shrink-0">
                Zepzo
              </Link>

              <form
                action="/shop"
                className="hidden md:flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md"
              >
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search for gifts..."
                  className="outline-none text-sm w-full"
                />
              </form>

              <div className="flex items-center gap-5 text-sm font-medium shrink-0">
                <AccountDrawer />
                <Link href="/wishlist" className="relative flex items-center gap-1 hover:text-brand-600">
                  <Heart size={18} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-semibold flex items-center justify-center">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative flex items-center gap-1 hover:text-brand-600">
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-semibold flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile-only search row - full width, sits below the logo/icons row */}
            <form action="/shop" className="md:hidden px-4 pb-3">
              <div className="flex items-center border border-gray-200 rounded-full px-4 py-2.5 bg-gray-50">
                <Search size={16} className="text-accent-500 mr-2 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search for gifts..."
                  className="outline-none text-sm w-full bg-transparent"
                />
              </div>
            </form>

            <TopCategoryBar categories={topBarCategories} />
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8 min-h-[60vh] pb-24 md:pb-8">{children}</main>

          <SiteFooter />

          <MobileBottomNav items={bottomNavItems} />
        </Providers>
      </body>
    </html>
  );
}
