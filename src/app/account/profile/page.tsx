"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import DeliveryAddressSection from "@/app/cart/DeliveryAddressSection";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Couldn't save changes");
      return;
    }

    setSaved(true);
    await update();
    setTimeout(() => setSaved(false), 2000);
  }

  if (!session) {
    return <p className="text-gray-400 text-center py-16">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal details, contact info, and delivery addresses.
        </p>
      </div>

      {/* Personal details */}
      <div className="border rounded-xl bg-white p-5 max-w-lg">
        <h2 className="font-semibold mb-4">Personal Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full name</label>
            <input
              type="text"
              className="border rounded-lg px-4 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              disabled
              className="border rounded-lg px-4 py-2 w-full bg-gray-50 text-gray-500"
              value={session.user?.email ?? ""}
            />
            <p className="text-xs text-gray-400 mt-1">
              Signed in with email & password. Email can't be changed here.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Phone number</label>
            <input
              type="tel"
              placeholder="e.g. 077 123 4567"
              className="border rounded-lg px-4 py-2 w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : saved ? (
              <>
                <Check size={14} /> Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Delivery addresses - reuses the same component from the cart page */}
      <div className="max-w-lg">
        <DeliveryAddressSection />
      </div>
    </div>
  );
}
