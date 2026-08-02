import { prisma } from "@/lib/prisma";
import BottomNavManager from "./BottomNavManager";

export default async function AdminBottomNavPage() {
  const items = await prisma.bottomNavItem.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mobile Bottom Navigation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Controls the 4-button bar fixed to the bottom of the screen on mobile — like Home,
          Categories, Offers, Account. Edit labels, links, icons, order, or turn any button off.
        </p>
      </div>
      <BottomNavManager
        initialItems={items.map((i) => ({
          id: i.id,
          label: i.label,
          href: i.href,
          emoji: i.emoji ?? "",
          imageUrl: i.imageUrl ?? "",
          displayOrder: i.displayOrder,
          active: i.active,
        }))}
      />
    </div>
  );
}
