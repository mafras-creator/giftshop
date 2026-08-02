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
  Smartphone,
  Monitor,
  Check,
} from "lucide-react";

type Banner = {
  id: string;
  imageUrl: string;
  mobileImageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  linkUrl: string;
  displayOrder: number;
  active: boolean;
};

export default function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingMobileId, setUploadingMobileId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [creatingFromUpload, setCreatingFromUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const desktopInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mobileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const newBannerInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return null;
    }
    return data.url as string;
  }

  async function handleCreateFromFile(file: File) {
    setError(null);
    setCreatingFromUpload(true);
    const url = await uploadFile(file);
    if (!url) {
      setCreatingFromUpload(false);
      return;
    }

    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    const data = await res.json();
    setCreatingFromUpload(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't create banner");
      return;
    }

    setBanners((prev) => [
      ...prev,
      {
        id: data.banner.id,
        imageUrl: data.banner.imageUrl,
        mobileImageUrl: "",
        title: "",
        subtitle: "",
        buttonText: "",
        linkUrl: "",
        displayOrder: data.banner.displayOrder,
        active: true,
      },
    ]);
    router.refresh();
  }

  async function handleReplaceImage(banner: Banner, file: File, target: "desktop" | "mobile") {
    setError(null);
    target === "desktop" ? setUploadingId(banner.id) : setUploadingMobileId(banner.id);

    const url = await uploadFile(file);
    if (!url) {
      target === "desktop" ? setUploadingId(null) : setUploadingMobileId(null);
      return;
    }

    const field = target === "desktop" ? "imageUrl" : "mobileImageUrl";
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: url }),
    });

    setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, [field]: url } : b)));
    target === "desktop" ? setUploadingId(null) : setUploadingMobileId(null);
    router.refresh();
  }

  function updateLocalField(id: string, field: keyof Banner, value: string) {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  }

  async function saveTextFields(banner: Banner) {
    setSavingId(banner.id);
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: banner.title || null,
        subtitle: banner.subtitle || null,
        buttonText: banner.buttonText || null,
        linkUrl: banner.linkUrl || null,
      }),
    });
    setSavingId(null);
    setSavedId(banner.id);
    setTimeout(() => setSavedId((current) => (current === banner.id ? null : current)), 2000);
    router.refresh();
  }

  async function toggleActive(banner: Banner) {
    const updated = { ...banner, active: !banner.active };
    setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: updated.active }),
    });
    router.refresh();
  }

  async function handleDelete(banner: Banner) {
    if (!confirm("Remove this banner permanently? This can't be undone.")) return;
    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function persistOrder(reordered: Banner[]) {
    setBanners(reordered);
    await fetch("/api/admin/banners/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: reordered.map((b, i) => ({ id: b.id, displayOrder: i })),
      }),
    });
    router.refresh();
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...banners];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persistOrder(next);
  }

  function moveDown(index: number) {
    if (index === banners.length - 1) return;
    const next = [...banners];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    persistOrder(next);
  }

  return (
    <div>
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {banners.map((banner, index) => (
          <div key={banner.id} className="border rounded-xl bg-white overflow-hidden">
            {/* Preview */}
            <div className="relative aspect-[16/7] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
              {uploadingId === banner.id && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-white" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleActive(banner)}
                  className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shadow ${
                    banner.active
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {banner.active ? "Live" : "Hidden"}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Image upload buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => desktopInputRefs.current[banner.id]?.click()}
                  disabled={uploadingId === banner.id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs border rounded-lg py-2 text-gray-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
                >
                  <Monitor size={13} />
                  Replace desktop image
                </button>
                <input
                  ref={(el) => {
                    desktopInputRefs.current[banner.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImage(banner, file, "desktop");
                    e.target.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={() => mobileInputRefs.current[banner.id]?.click()}
                  disabled={uploadingMobileId === banner.id}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs border rounded-lg py-2 text-gray-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
                >
                  {uploadingMobileId === banner.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Smartphone size={13} />
                  )}
                  {banner.mobileImageUrl ? "Replace mobile image" : "Add mobile image (optional)"}
                </button>
                <input
                  ref={(el) => {
                    mobileInputRefs.current[banner.id] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImage(banner, file, "mobile");
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Text fields */}
              <input
                type="text"
                placeholder="Title (optional, e.g. Birthday Special)"
                value={banner.title}
                onChange={(e) => updateLocalField(banner.id, "title", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Subtitle (optional)"
                value={banner.subtitle}
                onChange={(e) => updateLocalField(banner.id, "subtitle", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Button text, e.g. Shop Now"
                  value={banner.buttonText}
                  onChange={(e) => updateLocalField(banner.id, "buttonText", e.target.value)}
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Link, e.g. /shop?category=cakes"
                  value={banner.linkUrl}
                  onChange={(e) => updateLocalField(banner.id, "linkUrl", e.target.value)}
                  className="w-1/2 border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
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
                    disabled={index === banners.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded border text-gray-400 hover:text-brand-600 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="w-7 h-7 flex items-center justify-center rounded border text-gray-400 hover:text-red-500"
                    aria-label="Delete banner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button
                  onClick={() => saveTextFields(banner)}
                  disabled={savingId === banner.id}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors ${
                    savedId === banner.id
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {savingId === banner.id ? (
                    "Saving..."
                  ) : savedId === banner.id ? (
                    <>
                      <Check size={13} />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <p className="text-gray-400 text-sm mb-4">No banners yet — add your first one below.</p>
      )}

      {/* Add new */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => newBannerInputRef.current?.click()}
          disabled={creatingFromUpload}
          className="flex items-center gap-2 text-sm text-brand-600 font-medium hover:underline disabled:opacity-50"
        >
          {creatingFromUpload ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          {creatingFromUpload ? "Uploading..." : "Add new banner (upload image)"}
        </button>
        <input
          ref={newBannerInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCreateFromFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
