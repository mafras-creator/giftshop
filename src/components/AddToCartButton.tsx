"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

export default function AddToCartButton({
  productId,
  inStock,
  isLoggedIn,
}: {
  productId: string;
  inStock: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Couldn't add to cart");
      return;
    }

    setAdded(true);
    router.refresh();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleAddToCart}
        disabled={!inStock || loading}
        className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Adding...
          </>
        ) : added ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </>
        )}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
