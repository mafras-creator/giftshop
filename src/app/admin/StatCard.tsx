import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  children,
}: {
  label: string;
  value: string;
  change?: number | null;
  icon: LucideIcon;
  iconBg: string;
  children?: React.ReactNode;
}) {
  const isUp = (change ?? 0) > 0;
  const isFlat = change === 0 || change === null || change === undefined;

  return (
    <div className="border rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={16} className="text-white" />
          </span>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && change !== null && (
          <span
            className={`flex items-center text-xs font-medium ${
              isFlat ? "text-gray-400" : isUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {isFlat ? (
              <Minus size={14} />
            ) : isUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      {children && <div className="mt-3 h-12">{children}</div>}
    </div>
  );
}
