import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  Truck,
  ClipboardList,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/account/profile", label: "Profile", icon: UserCircle },
  { href: "/account/orders/track", label: "Track Order", icon: Truck },
  { href: "/account/orders", label: "Order History", icon: ClipboardList },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
  { href: "/account/reminders", label: "Reminders", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/account/profile");
  }

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-8">
      <aside>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">My Account</p>
        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
