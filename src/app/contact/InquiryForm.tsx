"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const queryTypes = [
  "General Inquiry",
  "Order Support",
  "Product Question",
  "Corporate Gifting",
  "Vendor Inquiry",
  "Other",
];

export default function InquiryForm() {
  const [form, setForm] = useState({
    queryType: queryTypes[0],
    fullName: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border rounded-xl bg-white p-8 text-center">
        <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-3" />
        <p className="font-semibold mb-1">Thanks for reaching out!</p>
        <p className="text-sm text-gray-500">
          We've received your message and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl bg-white p-5 space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Type of Query</label>
        <select
          className="border rounded-lg px-4 py-2 w-full"
          value={form.queryType}
          onChange={(e) => setForm({ ...form, queryType: e.target.value })}
        >
          {queryTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Full Name</label>
        <input
          type="text"
          required
          className="border rounded-lg px-4 py-2 w-full"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <input
            type="email"
            required
            className="border rounded-lg px-4 py-2 w-full"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Mobile Number</label>
          <input
            type="tel"
            required
            placeholder="077 123 4567"
            className="border rounded-lg px-4 py-2 w-full"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Message</label>
        <textarea
          required
          rows={4}
          className="border rounded-lg px-4 py-2 w-full"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
