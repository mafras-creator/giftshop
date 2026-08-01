"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete product.");
      return;
    }

    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline">
      Delete
    </button>
  );
}
