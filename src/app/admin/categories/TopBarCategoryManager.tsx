"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  topBarOrder: number;
  showInTopBar: boolean;
};

export default function TopBarCategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryTile[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);

  async function persistOrder(reordered: CategoryTile[]) {
    setCategories(reordered);
    await fetch("/api/admin/categories/reorder-topbar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((c, i) => ({ id: c.id, topBarOrder: i })),
      }),
    });
    router.refresh();
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...categories];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persistOrder(next);
  }

  function moveDown(index: number) {
    if (index === categories.length - 1) return;
    const next = [...categories];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    persistOrder(next);
  }

  async function toggleVisible(cat: CategoryTile) {
    const updated = { ...cat, showInTopBar: !cat.showInTopBar };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showInTopBar: updated.showInTopBar }),
    });
    router.refresh();
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        This list reuses the same categories, images, and emoji from above — it just controls a
        separate row: which ones appear in the bar below the search box (on every page), and in
        what order. Uploading a new image or renaming a category above updates it here too.
      </p>
      <div className="border rounded-xl bg-white divide-y">
        {categories.map((cat, index) => (
          <div key={cat.id} className="flex items-center gap-4 p-4">
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="w-7 h-7 flex items-center justify-center rounded border text-gray-400 hover:text-brand-600 disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === categories.length - 1}
                className="w-7 h-7 flex items-center justify-center rounded border text-gray-400 hover:text-brand-600 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span>{cat.emoji || "🎁"}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-gray-400">/shop?category={cat.slug}</p>
            </div>

            <button
              onClick={() => toggleVisible(cat)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
                cat.showInTopBar
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {cat.showInTopBar ? <Eye size={13} /> : <EyeOff size={13} />}
              {cat.showInTopBar ? "In top bar" : "Hidden"}
            </button>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="p-8 text-center text-gray-400">
            No categories yet — add one in the section above first.
          </p>
        )}
      </div>
    </div>
  );
}
