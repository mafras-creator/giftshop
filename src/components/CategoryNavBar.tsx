"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isFocusedRoute } from "@/lib/focusedRoutes";

export default function CategoryNavBar({
  categories,
}: {
  categories: { label: string; slug: string }[];
}) {
  const pathname = usePathname();
  if (isFocusedRoute(pathname)) return null;

  return (
    <nav className="border-t">
      <div className="max-w-6xl mx-auto flex items-center gap-6 px-4 py-2.5 text-sm overflow-x-auto">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="whitespace-nowrap text-gray-600 hover:text-brand-600"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
