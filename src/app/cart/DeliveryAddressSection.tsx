"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Check, Loader2 } from "lucide-react";

type Address = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export default function DeliveryAddressSection() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    const res = await fetch("/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses ?? []);
    setLoading(false);
    if ((data.addresses ?? []).length === 0) setShowForm(true);
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, { method: "PUT" });
    fetchAddresses();
  }

  async function handleSave() {
    if (!form.line1.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setError("Please fill in address, city, and postal code.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: addresses.length === 0 }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Couldn't save address");
      return;
    }

    setForm({ line1: "", line2: "", city: "", postalCode: "", country: "Sri Lanka" });
    setShowForm(false);
    fetchAddresses();
    router.refresh();
  }

  return (
    <div className="border rounded-xl bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-brand-600" />
        <h2 className="font-semibold">Delivery Address</h2>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Loading addresses...
        </p>
      ) : (
        <>
          {addresses.length > 0 && (
            <div className="space-y-2 mb-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => handleSetDefault(addr.id)}
                  className={`w-full text-left border-2 rounded-lg p-3 text-sm transition ${
                    addr.isDefault
                      ? "border-brand-600 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {addr.city}, {addr.postalCode}, {addr.country}
                      </p>
                    </div>
                    {addr.isDefault && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showForm ? (
            <div className="space-y-2 border-t pt-3 mt-3">
              <input
                type="text"
                placeholder="Street address"
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
              <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Postal code"
                  className="border rounded-lg px-3 py-2 text-sm w-full"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="Country"
                className="border rounded-lg px-3 py-2 text-sm w-full"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-sm text-gray-500 px-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:underline"
            >
              <Plus size={14} />
              Add new address
            </button>
          )}
        </>
      )}
    </div>
  );
}
