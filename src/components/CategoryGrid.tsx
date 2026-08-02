"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  emoji?: string | null;
  imageUrl?: string | null;
};

// How many tiles show before the "More" tile kicks in.
// 9 fills two neat rows of 5 (one slot left for the "More" tile itself) on mobile,
// and stays tidy on desktop grids too.
const INITIAL_COUNT = 9;

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center">
        No categories configured yet — add some from the admin dashboard.
      </p>
    );
  }

  const hasMore = categories.length > INITIAL_COUNT;
  const visible = expanded ? categories : categories.slice(0, INITIAL_COUNT);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-5">
      {visible.map((c) => (
        <Link
          key={c.id}
          href={`/shop?category=${c.slug}`}
          className="group flex flex-col items-center gap-1.5 text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center text-xl sm:text-2xl overflow-hidden ring-1 ring-brand-100 group-hover:ring-brand-300 group-hover:-translate-y-0.5 group-hover:shadow-soft transition-all duration-250">
            {c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
            ) : (
              <span>{c.emoji || "🎁"}</span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-gray-700 leading-tight line-clamp-2 max-w-[64px]">
            {c.name}
          </p>
        </Link>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="group flex flex-col items-center gap-1.5 text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-50 flex items-center justify-center ring-1 ring-gray-200 group-hover:ring-brand-300 group-hover:bg-brand-50 transition-all duration-250">
            {expanded ? (
              <ChevronUp size={18} className="text-brand-600" />
            ) : (
              <ChevronDown size={18} className="text-brand-600" />
            )}
          </div>
          <p className="text-[11px] sm:text-xs font-medium text-brand-600 leading-tight">
            {expanded ? "Less" : "More"}
          </p>
        </button>
      )}
    </div>
  );
}
