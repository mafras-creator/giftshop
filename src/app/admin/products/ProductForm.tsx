"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Upload, Loader2 } from "lucide-react";

type Category = { id: string; name: string };

type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrls: string[];
  isPersonalizable: boolean;
  personalizationTextEnabled: boolean;
  personalizationImageEnabled: boolean;
};

const MAX_IMAGES = 4;

export default function ProductForm({
  categories,
  initialValues,
}: {
  categories: Category[];
  initialValues?: ProductFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormValues>(
    initialValues ?? {
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: categories[0]?.id ?? "",
      imageUrls: [],
      isPersonalizable: false,
      personalizationTextEnabled: false,
      personalizationImageEnabled: false,
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function removeImage(index: number) {
    setForm({ ...form, imageUrls: form.imageUrls.filter((_, i) => i !== index) });
  }

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const remainingSlots = MAX_IMAGES - form.imageUrls.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setUploadError(`Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES}).`);
    }

    setUploading(true);

    for (const file of filesToUpload) {
      const body = new FormData();
      body.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();

        if (!res.ok) {
          setUploadError(data.error ?? "Upload failed");
          continue;
        }

        setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, data.url] }));
      } catch {
        setUploadError("Upload failed. Please try again.");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isEdit ? `/api/admin/products/${initialValues!.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium block mb-1">Product name</label>
        <input
          type="text"
          required
          className="border rounded-lg px-4 py-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea
          required
          rows={4}
          className="border rounded-lg px-4 py-2 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="border rounded-lg px-4 py-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Stock</label>
          <input
            type="number"
            min="0"
            required
            className="border rounded-lg px-4 py-2 w-full"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Category</label>
        <select
          required
          className="border rounded-lg px-4 py-2 w-full"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPersonalizable}
            onChange={(e) =>
              setForm({
                ...form,
                isPersonalizable: e.target.checked,
                ...(e.target.checked
                  ? {}
                  : { personalizationTextEnabled: false, personalizationImageEnabled: false }),
              })
            }
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">This product can be personalized</span>
        </label>

        {form.isPersonalizable && (
          <div className="mt-3 ml-6 space-y-2">
            <p className="text-xs text-gray-500 mb-2">
              Choose what the customer will be asked for on the product page:
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.personalizationTextEnabled}
                onChange={(e) =>
                  setForm({ ...form, personalizationTextEnabled: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Customer can type a message (e.g. name to print)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.personalizationImageEnabled}
                onChange={(e) =>
                  setForm({ ...form, personalizationImageEnabled: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">Customer can upload an image (e.g. photo to print)</span>
            </label>
            {!form.personalizationTextEnabled && !form.personalizationImageEnabled && (
              <p className="text-xs text-amber-600">
                Select at least one option above, or the "Personalized" badge will show but the
                customer won't be asked for anything.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">
          Product Images (up to {MAX_IMAGES})
        </label>

        {form.imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {form.imageUrls.map((url, index) => (
              <div key={url} className="relative w-20 h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                {index === 0 && (
                  <span className="absolute -top-2 -left-2 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {form.imageUrls.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 border-2 border-dashed rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition disabled:opacity-50 w-full justify-center"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload from your device ({form.imageUrls.length}/{MAX_IMAGES})
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        {uploadError && <p className="text-red-600 text-xs mt-1">{uploadError}</p>}

        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WEBP, or GIF. Max 5MB each. The first image is used as the main product
          thumbnail.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
