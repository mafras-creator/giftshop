import { prisma } from "@/lib/prisma";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shop by Category</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control which categories appear on the homepage, their images, and their order.
          Changes here update the "Shop by Category" section immediately.
        </p>
      </div>
      <CategoryManager
        initialCategories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          emoji: c.emoji ?? "",
          imageUrl: c.imageUrl ?? "",
          displayOrder: c.displayOrder,
          showOnHome: c.showOnHome,
        }))}
      />
    </div>
  );
}
