"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function Sparkline({
  data,
  color,
}: {
  data: { value: number }[];
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
