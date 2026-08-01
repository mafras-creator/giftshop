import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const session = await getServerSession(authOptions);

  const [products, categories, wishlistItems] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(searchParams.q
          ? { name: { contains: searchParams.q, mode: "insensitive" as const } }
          : {}),
        ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
      },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    session
      ? prisma.wishlistItem.findMany({
          where: { userId: (session.user as any).id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const wishlistedIds = new Set(wishlistItems.map((w) => w.productId));

  const activeCategory = categories.find((c) => c.slug === searchParams.category);

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Categories</p>
          <nav className="flex flex-col gap-1 text-sm">
            <Link
              href="/shop"
              className={`px-3 py-2 rounded-lg transition ${
                !searchParams.category
                  ? "bg-brand-50 text-brand-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Gifts
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`px-3 py-2 rounded-lg transition ${
                  searchParams.category === c.slug
                    ? "bg-brand-50 text-brand-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{activeCategory ? activeCategory.name : "All Gifts"}</h1>
            <p className="text-sm text-gray-500">{products.length} products</p>
          </div>
          <form>
            {searchParams.category && (
              <input type="hidden" name="category" value={searchParams.category} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search gifts..."
              className="border rounded-lg px-4 py-2 w-full md:w-72"
            />
          </form>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            No products found{searchParams.q ? ` for "${searchParams.q}"` : ""}.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price.toString()}
                imageUrl={product.images[0]?.url}
                categoryName={product.category.name}
                isPersonalizable={product.isPersonalizable}
                isWishlisted={wishlistedIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
