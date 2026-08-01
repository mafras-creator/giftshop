import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Price from "@/components/Price";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PROCESSING: "bg-sky-100 text-sky-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrderHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/orders");

  const userId = (session.user as any).id as string;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Order History</h1>
      <p className="text-sm text-gray-500 mb-6">All your past and current orders.</p>

      {orders.length === 0 ? (
        <div className="border rounded-xl bg-white text-center py-16">
          <Package size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 mb-4">You haven't placed any orders yet.</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl bg-white p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    statusColors[order.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="border-t pt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} × {item.quantity}
                    </span>
                    <Price amountUSD={Number(item.price) * item.quantity} />
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-sm">
                <span>Total</span>
                <Price amountUSD={order.total.toString()} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
