import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteProductButton from "./DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-gray-500">{p.category.name}</td>
                <td className="p-3">${p.price.toString()}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right space-x-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-brand-600 hover:underline">
                    Edit
                  </Link>
                  <DeleteProductButton productId={p.id} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
