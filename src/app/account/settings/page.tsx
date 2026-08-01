"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import { Check } from "lucide-react";
import { useEffect } from "react";

const currencyOptions: { code: "LKR" | "USD"; label: string; sub: string }[] = [
  { code: "LKR", label: "Sri Lankan Rupee", sub: "Rs. (LKR)" },
  { code: "USD", label: "US Dollar", sub: "$ (USD)" },
];

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account/settings");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <p className="text-gray-400 text-center py-16">Loading...</p>;
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
      <p className="text-sm text-gray-500 mb-8">
        Signed in as {session.user?.email}
      </p>

      <div className="border rounded-xl bg-white p-5">
        <h2 className="font-semibold mb-1">Currency</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose how prices are displayed across the site.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {currencyOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setCurrency(opt.code)}
              className={`relative border-2 rounded-xl p-4 text-left transition ${
                currency === opt.code
                  ? "border-brand-600 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {currency === opt.code && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </span>
              )}
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Prices update instantly across the site. This preference is saved on this device.
        </p>
      </div>
    </div>
  );
}
