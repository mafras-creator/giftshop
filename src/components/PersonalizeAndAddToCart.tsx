"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2, Upload, X, Sparkles } from "lucide-react";

export default function PersonalizeAndAddToCart({
  productId,
  inStock,
  isLoggedIn,
  textEnabled,
  imageEnabled,
}: {
  productId: string;
  inStock: boolean;
  isLoggedIn: boolean;
  textEnabled: boolean;
  imageEnabled: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setError("Upload failed. Please try again.");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/cart");
      return;
    }

    if (textEnabled && !message.trim()) {
      setError("Please add your personalization message");
      return;
    }
    if (imageEnabled && !imageUrl) {
      setError("Please upload an image for this product");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: 1,
        ...(textEnabled ? { personalizationText: message.trim() } : {}),
        ...(imageEnabled && imageUrl ? { personalizationImageUrl: imageUrl } : {}),
      }),
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
      <div className="border border-brand-200 bg-brand-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-brand-600" />
          <p className="text-sm font-semibold text-brand-700">Personalize this gift</p>
        </div>

        {textEnabled && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Your message (e.g. name to print)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Happy Birthday, Sarah!"
              className="border rounded-lg px-3 py-2 text-sm w-full bg-white"
            />
          </div>
        )}

        {imageEnabled && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Upload an image to print
            </label>
            {imageUrl ? (
              <div className="relative w-20 h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Your upload" className="w-full h-full object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 border-2 border-dashed rounded-lg px-3 py-2 text-xs text-gray-500 hover:border-brand-400 hover:text-brand-600 transition disabled:opacity-50 bg-white"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Choose image from your device
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!inStock || loading || uploading}
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
