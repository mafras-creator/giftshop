"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Check,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  emoji: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
};

export default function BottomNavManager({ initialItems }: { initialItems: NavItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");
  const [creating, setCreating] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateLocalField(id: string, field: "label" | "href", value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  async function saveFields(item: NavItem) {
    setSavingId(item.id);
    await fetch(`/api/admin/bottom-nav/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: item.label, href: item.href }),
    });
    setSavingId(null);
    setSavedId(item.id);
    setTimeout(() => setSavedId((current) => (current === item.id ? null : current)), 2000);
    router.refresh();
  }

  async function handleImageUpload(item: NavItem, file: File) {
    setError(null);
    setUploadingId(item.id);

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

      await fetch(`/api/admin/bottom-nav/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });

      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, imageUrl: uploadData.url } : i)));
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    }

    setUploadingId(null);
  }

  async function toggleActive(item: NavItem) {
    const updated = { ...item, active: !item.active };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await fetch(`/api/admin/bottom-nav/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: updated.active }),
    });
    router.refresh();
  }

  async function handleDelete(item: NavItem) {
    if (!confirm(`Remove "${item.label}" from the bottom navigation permanently?`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await fetch(`/api/admin/bottom-nav/${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function persistOrder(reordered: NavItem[]) {
    setItems(reordered);
    await fetch("/api/admin/bottom-nav/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((i, idx) => ({ id: i.id, displayOrder: idx })),
      }),
    });
    router.refresh();
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persistOrder(next);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    persistOrder(next);
  }

  async function handleCreate() {
    if (!newLabel.trim() || !newHref.trim()) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/admin/bottom-nav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), href: newHref.trim() }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't add button");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: data.item.id,
        label: data.item.label,
        href: data.item.href,
        emoji: "🔗",
        imageUrl: "",
        displayOrder: data.item.displayOrder,
        active: true,
      },
    ]);
    setNewLabel("");
    setNewHref("");
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

      {items.length > 4 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          You have more than 4 active buttons — a bottom nav bar with more than 4-5 items gets
          cramped on small phone screens. Consider hiding some with the toggle below.
        </p>
      )}

      <div className="border rounded-xl bg-white divide-y">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
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
                disabled={index === items.length - 1}
                className="w-7 h-7 flex items-center justify-center rounded border text-gray-400 hover:text-brand-600 disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" />
              ) : (
                <span>{item.emoji || "🔗"}</span>
              )}
              {uploadingId === item.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 grid sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateLocalField(item.id, "label", e.target.value)}
                placeholder="Label, e.g. Offers"
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateLocalField(item.id, "href", e.target.value)}
                placeholder="Link, e.g. /shop"
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRefs.current[item.id]?.click()}
              disabled={uploadingId === item.id}
              className="hidden md:flex items-center gap-1 text-xs text-brand-600 hover:underline disabled:opacity-50 shrink-0"
            >
              <Upload size={12} />
              Icon
            </button>
            <input
              ref={(el) => {
                fileInputRefs.current[item.id] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(item, file);
                e.target.value = "";
              }}
            />

            <button
              onClick={() => toggleActive(item)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
                item.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              {item.active ? <Eye size={13} /> : <EyeOff size={13} />}
              {item.active ? "Visible" : "Hidden"}
            </button>

            <button
              onClick={() => saveFields(item)}
              disabled={savingId === item.id}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 disabled:opacity-50 transition-colors ${
                savedId === item.id
                  ? "bg-emerald-500 text-white"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            >
              {savingId === item.id ? (
                "Saving..."
              ) : savedId === item.id ? (
                <span className="flex items-center gap-1">
                  <Check size={13} /> Saved
                </span>
              ) : (
                "Save"
              )}
            </button>

            <button
              onClick={() => handleDelete(item)}
              className="text-gray-400 hover:text-red-500 shrink-0"
              aria-label="Delete button"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="p-8 text-center text-gray-400">No bottom nav buttons yet.</p>
        )}
      </div>

      <div className="mt-4">
        {showAddForm ? (
          <div className="flex flex-wrap gap-2 items-center border rounded-xl bg-white p-3">
            <input
              type="text"
              placeholder="Label, e.g. Wishlist"
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <input
              type="text"
              placeholder="Link, e.g. /wishlist"
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
              value={newHref}
              onChange={(e) => setNewHref(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newLabel.trim() || !newHref.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {creating ? "Adding..." : "Add"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="text-sm text-gray-500 px-2">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline"
          >
            <Plus size={15} />
            Add new button
          </button>
        )}
      </div>
    </div>
  );
}
