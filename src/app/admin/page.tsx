import { prisma } from "@/lib/prisma";
import StatCard from "./StatCard";
import Sparkline from "./Sparkline";
import RevenueChart from "./RevenueChart";
import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, Heart } from "lucide-react";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboard() {
  const now = new Date();
  const today = startOfDay(now);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [
    productCount,
    orderCount,
    customerCount,
    revenueAgg,
    ordersLast7,
    ordersPrev7,
    revenueLast7,
    revenuePrev7,
    recentOrders,
    lowStockProducts,
    ordersLast14Days,
    wishlistCount,
    topWishlistedRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "PAID", createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "PAID", createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, total: true, status: true },
    }),
    prisma.wishlistItem.count(),
    prisma.wishlistItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
    }),
  ]);

  const topWishlistedProducts = await prisma.product.findMany({
    where: { id: { in: topWishlistedRaw.map((w) => w.productId) } },
  });
  const topWishlisted = topWishlistedRaw.map((w) => ({
    product: topWishlistedProducts.find((p) => p.id === w.productId),
    count: w._count.productId,
  }));

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const revenueChange = pctChange(
    Number(revenueLast7._sum.total ?? 0),
    Number(revenuePrev7._sum.total ?? 0)
  );
  const ordersChange = pctChange(ordersLast7, ordersPrev7);

  // Build a 14-day series for the chart, bucketing orders by day
  const chartData: { day: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayOrders = ordersLast14Days.filter(
      (o) => startOfDay(o.createdAt).getTime() === d.getTime()
    );
    chartData.push({
      day: label,
      revenue: dayOrders
        .filter((o) => o.status === "PAID")
        .reduce((sum, o) => sum + Number(o.total), 0),
      orders: dayOrders.length,
    });
  }

  const sparkFromDaily = (key: "revenue" | "orders") =>
    chartData.slice(-7).map((d) => ({ value: d[key] }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Overview</p>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Revenue (paid)"
          value={`$${totalRevenue.toFixed(2)}`}
          change={revenueChange}
          icon={DollarSign}
          iconBg="bg-emerald-500"
        >
          <Sparkline data={sparkFromDaily("revenue")} color="#10b981" />
        </StatCard>

        <StatCard
          label="Orders"
          value={String(orderCount)}
          change={ordersChange}
          icon={ShoppingCart}
          iconBg="bg-brand-600"
        >
          <Sparkline data={sparkFromDaily("orders")} color="#e11d48" />
        </StatCard>

        <StatCard
          label="Customers"
          value={String(customerCount)}
          icon={Users}
          iconBg="bg-sky-500"
        />

        <StatCard
          label="Products"
          value={String(productCount)}
          icon={Package}
          iconBg="bg-amber-500"
        />

        <StatCard
          label="Wishlisted"
          value={String(wishlistCount)}
          icon={Heart}
          iconBg="bg-pink-500"
        />
      </div>

      {/* Revenue chart + low stock */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-xl p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Revenue — last 14 days</h2>
          </div>
          <RevenueChart data={chartData} />
        </div>

        <div className="border rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-semibold">Low stock</h2>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400">Everything's well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link href={`/admin/products/${p.id}/edit`} className="hover:text-brand-600">
                    {p.name}
                  </Link>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.stock === 0
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Most wishlisted */}
      <div className="border rounded-xl p-5 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-pink-500" />
          <h2 className="font-semibold">Most Wishlisted</h2>
        </div>
        {topWishlisted.filter((w) => w.product).length === 0 ? (
          <p className="text-sm text-gray-400">No wishlist activity yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topWishlisted
              .filter((w) => w.product)
              .map(({ product, count }) => (
                <li key={product!.id}>
                  <Link
                    href={`/admin/products/${product!.id}/edit`}
                    className="block border rounded-lg p-3 hover:border-brand-300 transition"
                  >
                    <p className="text-sm font-medium truncate">{product!.name}</p>
                    <p className="text-xs text-pink-500 mt-1 flex items-center gap-1">
                      <Heart size={11} className="fill-pink-500" />
                      {count} wishlisted
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Recent orders */}
      <div className="border rounded-xl bg-white overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm mt-4">
          <thead className="text-left text-gray-500 border-t">
            <tr>
              <th className="p-3 pl-5">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 pr-5">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 pl-5 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">{o.user.name}</td>
                <td className="p-3">${o.total.toString()}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{o.status}</span>
                </td>
                <td className="p-3 pr-5 text-gray-500">
                  {o.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
