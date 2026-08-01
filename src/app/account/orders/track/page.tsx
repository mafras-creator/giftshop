import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck, CheckCircle2, Circle } from "lucide-react";

const steps = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function TrackOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/orders/track");

  const userId = (session.user as any).id as string;

  // Show the most recent non-cancelled order as the one being tracked
  const activeOrder = await prisma.order.findFirst({
    where: { userId, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Track Order</h1>
      <p className="text-sm text-gray-500 mb-6">Follow your most recent order's progress.</p>

      {!activeOrder ? (
        <div className="border rounded-xl bg-white text-center py-16">
          <Truck size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 mb-4">No active order to track yet.</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="border rounded-xl bg-white p-6">
          <p className="text-xs text-gray-400 font-mono mb-6">
            Order #{activeOrder.id.slice(0, 8)}
          </p>

          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const currentIndex = steps.indexOf(activeOrder.status);
              const done = i <= currentIndex;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                        done ? "bg-brand-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                  {done ? (
                    <CheckCircle2 size={22} className="text-brand-600 bg-white" />
                  ) : (
                    <Circle size={22} className="text-gray-300 bg-white" />
                  )}
                  <p
                    className={`text-xs mt-2 text-center ${
                      done ? "text-brand-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
