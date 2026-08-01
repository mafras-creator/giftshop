import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LayoutDashboard, Package, ShoppingBag, LayoutGrid, MessageSquare } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if ((session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const unreadCount = await prisma.contactInquiry.count({ where: { isRead: false } });

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, badge: unreadCount },
  ];

  return (
    <div className="grid grid-cols-[200px_1fr] gap-8">
      <aside className="border-r pr-4">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Admin</p>
        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-brand-600 transition"
            >
              <span className="flex items-center gap-2">
                <Icon size={16} />
                {label}
              </span>
              {Boolean(badge) && (
                <span className="bg-accent-500 text-white text-[10px] font-semibold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
