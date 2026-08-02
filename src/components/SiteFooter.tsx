"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { isFocusedRoute } from "@/lib/focusedRoutes";

export default function SiteFooter() {
  const pathname = usePathname();
  if (isFocusedRoute(pathname)) return null;

  return (
    <footer className="border-t mt-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-bold text-brand-600 mb-3">Zepzo</p>
          <p className="text-gray-500">
            Thoughtful gifts for every relationship and occasion, delivered with care.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-3">Shop</p>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/shop" className="hover:text-brand-600">All Gifts</Link></li>
            <li><Link href="/shop?category=birthday-gifts" className="hover:text-brand-600">Birthday</Link></li>
            <li><Link href="/shop?category=anniversary-gifts" className="hover:text-brand-600">Anniversary</Link></li>
            <li><Link href="/shop?category=personalized-gifts" className="hover:text-brand-600">Personalized</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Account</p>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/login" className="hover:text-brand-600">Login</Link></li>
            <li><Link href="/register" className="hover:text-brand-600">Register</Link></li>
            <li><Link href="/orders" className="hover:text-brand-600">Order Tracking</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Support</p>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/faq" className="hover:text-brand-600">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Zepzo. All rights reserved.
      </div>
    </footer>
  );
}
