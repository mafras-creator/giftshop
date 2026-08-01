"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Upload, Loader2, Eye, EyeOff, Plus } from "lucide-react";

type CategoryTile = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  displayOrder: number;
  showOnHome: boolean;
};

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryTile[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function persistOrder(reordered: CategoryTile[]) {
    setCategories(reordered);
    await fetch("/api/admin/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((c, i) => ({ id: c.id, displayOrder: i })),
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
    const updated = { ...cat, showOnHome: !cat.showOnHome };
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showOnHome: updated.showOnHome }),
    });
    router.refresh();
  }

  async function handleImageUpload(cat: CategoryTile, file: File) {
    setError(null);
    setUploadingId(cat.id);

    const body = new FormData();
    body.append("file", file);

    try {
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error ?? "Upload failed");
        setUploadingId(null);
        return;
      }

      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, imageUrl: uploadData.url } : c))
      );
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    }

    setUploadingId(null);
  }

  async function handleDelete(cat: CategoryTile) {
    if (
      !confirm(
        `Remove "${cat.name}" from Shop by Category? This won't delete the category itself or its products — it just hides it from this homepage section. To fully delete, use the main Categories list.`
      )
    ) {
      return;
    }
    await toggleVisible(cat);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);

    const slug = newName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), slug }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't create category");
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
        emoji: "🎁",
        imageUrl: "",
        displayOrder: data.category.displayOrder,
        showOnHome: true,
      },
    ]);
    setNewName("");
    setShowAddForm(false);
    router.refresh();
  }

  return (
    <div>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="border rounded-xl bg-white divide-y">
        {categories.map((cat, index) => (
          <div key={cat.id} className="flex items-center gap-4 p-4">
            {/* Reorder buttons */}
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

            {/* Image preview / upload */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span>{cat.emoji || "🎁"}</span>
              )}
              {uploadingId === cat.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Name + upload button */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-xs text-gray-400 mb-1">/shop?category={cat.slug}</p>
              <button
                type="button"
                onClick={() => fileInputRefs.current[cat.id]?.click()}
                disabled={uploadingId === cat.id}
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline disabled:opacity-50"
              >
                <Upload size={12} />
                {cat.imageUrl ? "Replace image" : "Upload image"}
              </button>
              <input
                ref={(el) => (fileInputRefs.current[cat.id] = el)}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(cat, file);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Visibility toggle */}
            <button
              onClick={() => toggleVisible(cat)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
                cat.showOnHome
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {cat.showOnHome ? <Eye size={13} /> : <EyeOff size={13} />}
              {cat.showOnHome ? "Visible" : "Hidden"}
            </button>

            <button
              onClick={() => handleDelete(cat)}
              className="text-gray-400 hover:text-red-500 shrink-0"
              aria-label="Remove from homepage"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="p-8 text-center text-gray-400">No categories yet.</p>
        )}
      </div>

      {/* Add new */}
      <div className="mt-4">
        {showAddForm ? (
          <div className="flex gap-2 items-center border rounded-xl bg-white p-3">
            <input
              type="text"
              placeholder="New category name, e.g. Wedding Gifts"
              className="border rounded-lg px-3 py-2 text-sm flex-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {creating ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-gray-500 px-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline"
          >
            <Plus size={15} />
            Add new category
          </button>
        )}
      </div>
    </div>
  );
}
