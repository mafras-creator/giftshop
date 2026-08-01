import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/wishlist");

  const userId = (session.user as any).id as string;

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { images: true, category: true } } },
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Wishlist</h1>
      <p className="text-sm text-gray-500 mb-6">
        {items.length} {items.length === 1 ? "item" : "items"} saved
      </p>

      {items.length === 0 ? (
        <div className="border rounded-xl bg-white text-center py-16">
          <Heart size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Browse Gifts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              productId={item.product.id}
              slug={item.product.slug}
              name={item.product.name}
              price={item.product.price.toString()}
              imageUrl={item.product.images[0]?.url}
              categoryName={item.product.category.name}
              isPersonalizable={item.product.isPersonalizable}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
