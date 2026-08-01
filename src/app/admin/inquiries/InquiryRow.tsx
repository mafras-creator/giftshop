"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Trash2, ChevronDown } from "lucide-react";

export default function InquiryRow({
  id,
  queryType,
  fullName,
  email,
  mobile,
  message,
  isRead,
  createdAt,
}: {
  id: string;
  queryType: string;
  fullName: string;
  email: string;
  mobile: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggleExpand() {
    setExpanded((e) => !e);
    if (!isRead) {
      setLoading(true);
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setLoading(false);
      router.refresh();
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete this inquiry from ${fullName}?`)) return;
    await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div
      className={`border rounded-xl bg-white overflow-hidden ${
        !isRead ? "border-brand-300" : "border-gray-200"
      }`}
    >
      <button
        onClick={handleToggleExpand}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {!isRead && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {fullName}
              <span className="text-gray-400 font-normal"> — {queryType}</span>
            </p>
            <p className="text-xs text-gray-400 truncate">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400">{createdAt}</span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-4 bg-gray-50 text-sm space-y-3">
          <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
          <div className="flex flex-wrap gap-4 text-gray-500 text-xs pt-2 border-t">
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-brand-600">
              <Mail size={13} /> {email}
            </a>
            <a href={`tel:${mobile}`} className="flex items-center gap-1.5 hover:text-brand-600">
              <Phone size={13} /> {mobile}
            </a>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 ml-auto"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
