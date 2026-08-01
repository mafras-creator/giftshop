import { Bell } from "lucide-react";

export default function RemindersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Reminders</h1>
      <p className="text-sm text-gray-500 mb-6">
        Never miss a birthday or anniversary again.
      </p>
      <div className="border rounded-xl bg-white text-center py-16">
        <Bell size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-400">
          Gift reminders aren't available yet — this is coming in a future update.
        </p>
      </div>
    </div>
  );
}
