"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  X,
  UserCircle,
  Truck,
  ClipboardList,
  Wallet,
  Bell,
  Phone,
  Shield,
  FileText,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Profile", href: "/account/profile", icon: UserCircle },
  { label: "Track Order", href: "/account/orders/track", icon: Truck },
  { label: "Order History", href: "/account/orders", icon: ClipboardList },
  { label: "Wallet", href: "/account/wallet", icon: Wallet },
  { label: "Reminders", href: "/account/reminders", icon: Bell },
];

const footerItems = [
  { label: "Contact Us", href: "/contact", icon: Phone },
  { label: "Privacy Policy", href: "/privacy", icon: Shield },
  { label: "Terms & Conditions", href: "/terms", icon: FileText },
];

export default function AccountDrawer() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleNavigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  }

  if (!session) {
    return (
      <Link href="/login" className="flex items-center gap-1 hover:text-brand-600">
        <User size={18} />
      </Link>
    );
  }

  const initial = session.user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 hover:text-brand-600"
        aria-label="Account menu"
      >
        <User size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col drawer-slide-in">
            {/* Header with user info */}
            <div className="p-5 border-b bg-gradient-to-br from-brand-600 to-brand-700 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-brand-100">My Account</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{session.user?.name}</p>
                  <p className="text-xs text-brand-100 truncate">{session.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Main menu */}
            <div className="flex-1 overflow-y-auto py-3">
              <nav className="flex flex-col">
                {menuItems.map(({ label, href, icon: Icon }) => (
                  <button
                    key={href}
                    onClick={() => handleNavigate(href)}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition text-left"
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="border-t my-3" />

              <nav className="flex flex-col">
                {footerItems.map(({ label, href, icon: Icon }) => (
                  <button
                    key={href}
                    onClick={() => handleNavigate(href)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition text-left"
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Sign out */}
            <div className="border-t p-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full justify-center text-sm font-medium text-red-600 border border-red-200 rounded-lg py-2.5 hover:bg-red-50 transition"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
