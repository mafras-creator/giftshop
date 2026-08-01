"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import Price from "@/components/Price";

export default function CartItemRow({
  productId,
  name,
  slug,
  price,
  quantity,
  stock,
  imageUrl,
  personalizationText,
  personalizationImageUrl,
}: {
  productId: string;
  name: string;
  slug: string;
  price: string;
  quantity: number;
  stock: number;
  imageUrl?: string;
  personalizationText?: string | null;
  personalizationImageUrl?: string | null;
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
    <div className="p-4">
      <div className="flex items-center gap-4">
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
          <Price amountUSD={price} className="text-brand-600 font-semibold text-sm mt-1 block" />
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

        <p className="w-20 text-right text-sm font-semibold shrink-0">
          <Price amountUSD={Number(price) * quantity} />
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

      {(personalizationText || personalizationImageUrl) && (
        <div className="mt-3 ml-20 flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-lg p-3">
          <Sparkles size={14} className="text-brand-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            {personalizationText && (
              <p className="text-xs text-gray-700">
                <span className="font-medium">Message:</span> {personalizationText}
              </p>
            )}
            {personalizationImageUrl && (
              <div className="mt-1.5">
                <p className="text-xs font-medium text-gray-700 mb-1">Uploaded image:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personalizationImageUrl}
                  alt="Your personalization upload"
                  className="w-12 h-12 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
