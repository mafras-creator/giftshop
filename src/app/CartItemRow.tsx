"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";

export default function CartItemRow({
  productId,
  name,
  slug,
  price,
  quantity,
  stock,
  imageUrl,
}: {
  productId: string;
  name: string;
  slug: string;
  price: string;
  quantity: number;
  stock: number;
  imageUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1 || newQuantity > stock) return;
    setLoading(true);

    await fetch(`/api/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    router.refresh();
    setLoading(false);
  }

  async function handleRemove() {
    setLoading(true);
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <Link href={`/product/${slug}`} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/product/${slug}`} className="font-medium text-sm hover:text-brand-600 line-clamp-1">
          {name}
        </Link>
        <p className="text-brand-600 font-semibold text-sm mt-1">${Number(price).toFixed(2)}</p>
      </div>

      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => updateQuantity(quantity - 1)}
          disabled={loading || quantity <= 1}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-600 disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm">{loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : quantity}</span>
        <button
          onClick={() => updateQuantity(quantity + 1)}
          disabled={loading || quantity >= stock}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-brand-600 disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="w-16 text-right text-sm font-semibold shrink-0">
        ${(Number(price) * quantity).toFixed(2)}
      </p>

      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-gray-400 hover:text-red-500 shrink-0"
        aria-label="Remove from cart"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
