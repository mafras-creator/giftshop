"use client";

import Link from "next/link";
import { Heart, Star, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Price from "@/components/Price";

type ProductCardProps = {
  productId: string;
  slug: string;
  name: string;
  price: string | number;
  originalPrice?: string | number;
  imageUrl?: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  badge?: "Trending" | "Best Seller" | "New" | "Selling Fast" | "Limited Stock";
  isPersonalizable?: boolean;
  isWishlisted?: boolean;
};

export default function ProductCard({
  productId,
  slug,
  name,
  price,
  originalPrice,
  imageUrl,
  categoryName,
  rating = 4.5,
  reviewCount,
  badge,
  isPersonalizable = false,
  isWishlisted = false,
}: ProductCardProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [loading, setLoading] = useState(false);

  const discountPct =
    originalPrice && Number(originalPrice) > Number(price)
      ? Math.round((1 - Number(price) / Number(originalPrice)) * 100)
      : null;

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const nextState = !wishlisted;
    setWishlisted(nextState); // optimistic update

    const res = nextState
      ? await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
      : await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });

    setLoading(false);

    if (res.status === 401) {
      setWishlisted(!nextState); // revert
      router.push("/login?callbackUrl=/shop");
      return;
    }

    if (!res.ok) {
      setWishlisted(!nextState); // revert on failure
      return;
    }

    router.refresh(); // updates the header badge count
  }

  return (
    <Link
      href={`/product/${slug}`}
      className="group relative block w-full rounded-card bg-white border border-gray-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 hover:ring-2 hover:ring-brand-200 transition-all duration-250 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-250"
          />
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-pill">
            {badge}
          </span>
        )}

        {/* Discount badge */}
        {discountPct && (
          <span className="absolute top-3 right-12 bg-accent-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-pill">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 shadow-soft flex items-center justify-center hover:scale-110 transition-transform duration-250 disabled:opacity-60"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            className={wishlisted ? "fill-accent-500 text-accent-500" : "text-gray-400"}
          />
        </button>

        {/* Quick add */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-brand-600 text-white shadow-soft-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-250"
          aria-label="Quick add to cart"
        >
          <Plus size={16} />
        </button>

        {/* Personalized badge */}
        {isPersonalizable && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 text-brand-700 text-[11px] font-semibold px-2.5 py-1 rounded-pill shadow-soft">
            <Sparkles size={11} />
            Personalized
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {categoryName && (
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{categoryName}</p>
        )}
        <p className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{name}</p>

        <div className="flex items-center gap-1 mt-1.5">
          <Star size={12} className="fill-accent-500 text-accent-500" />
          <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-xs text-gray-400">({reviewCount})</span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <Price amountUSD={price} className="text-brand-700 font-bold" />
          {originalPrice && Number(originalPrice) > Number(price) && (
            <p className="text-xs text-gray-400 line-through">
              <Price amountUSD={originalPrice} />
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
