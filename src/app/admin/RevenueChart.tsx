"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { day: string; revenue: number; orders: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis
          dataKey="day"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="#9ca3af"
        />
        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#9ca3af" width={40} />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "revenue" ? `$${value.toFixed(2)}` : value,
            name === "revenue" ? "Revenue" : "Orders",
          ]}
          contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#e11d48" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
