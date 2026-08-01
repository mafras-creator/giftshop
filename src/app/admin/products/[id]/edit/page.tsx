import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { images: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const imageUrls = product.images.map((img) => img.url);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        categories={categories}
        initialValues={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          stock: product.stock.toString(),
          categoryId: product.categoryId,
          imageUrls: imageUrls,
        }}
      />
    </div>
  );
}
