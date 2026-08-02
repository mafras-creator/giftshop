"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isFocusedRoute } from "@/lib/focusedRoutes";

type Category = {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  imageUrl?: string | null;
};

export default function TopCategoryBar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  if (isFocusedRoute(pathname)) return null;
  if (categories.length === 0) return null;

  return (
    <nav className="border-t bg-white">
      {/* Mobile: icon grid, matches the app-style category grid */}
      <div className="md:hidden max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-5 gap-x-2 gap-y-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center text-lg overflow-hidden ring-1 ring-brand-100">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{c.emoji || "🎁"}</span>
                )}
              </div>
              <p className="text-[10px] font-medium text-gray-700 leading-tight line-clamp-2 max-w-[60px]">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal text row */}
      <div className="hidden md:flex max-w-6xl mx-auto items-center gap-6 px-4 py-2.5 text-sm overflow-x-auto scrollbar-hide">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className="whitespace-nowrap text-gray-600 hover:text-brand-600 font-medium"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
