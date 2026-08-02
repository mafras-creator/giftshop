import { prisma } from "@/lib/prisma";
import BannerManager from "./BannerManager";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Homepage Banners</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control the rotating banner at the top of the homepage — add or remove slides, set the
          order, and upload separate images for mobile and desktop if you want different crops.
        </p>
      </div>
      <BannerManager
        initialBanners={banners.map((b) => ({
          id: b.id,
          imageUrl: b.imageUrl,
          mobileImageUrl: b.mobileImageUrl ?? "",
          title: b.title ?? "",
          subtitle: b.subtitle ?? "",
          buttonText: b.buttonText ?? "",
          linkUrl: b.linkUrl ?? "",
          displayOrder: b.displayOrder,
          active: b.active,
        }))}
      />
    </div>
  );
}
