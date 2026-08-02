"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isFocusedRoute } from "@/lib/focusedRoutes";

type NavItem = {
  id: string;
  label: string;
  href: string;
  emoji?: string | null;
  imageUrl?: string | null;
};

export default function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (isFocusedRoute(pathname)) return null;
  if (items.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t pb-[env(safe-area-inset-bottom)]">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive ? "text-brand-600" : "text-gray-500"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-base leading-none overflow-hidden rounded">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{item.emoji || "🔗"}</span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
