import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import CartItemRow from "./CartItemRow";
import Price from "@/components/Price";
import DeliveryAddressSection from "./DeliveryAddressSection";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/cart");
  }

  const userId = (session.user as any).id as string;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: true } } },
    orderBy: { id: "desc" },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-6 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold">Your Cart</h1>

        {/* Quick search to keep adding more products without leaving the cart */}
        <form
          action="/shop"
          className="flex items-center border rounded-lg px-3 py-2 w-full max-w-xs"
        >
          <Search size={15} className="text-gray-400 mr-2" />
          <input
            type="text"
            name="q"
            placeholder="Search to add more gifts..."
            className="outline-none text-sm w-full"
          />
        </form>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Your cart is empty.</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Browse Gifts
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="space-y-6">
            <div className="border rounded-xl bg-white divide-y">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  productId={item.productId}
                  name={item.product.name}
                  slug={item.product.slug}
                  price={item.product.price.toString()}
                  quantity={item.quantity}
                  stock={item.product.stock}
                  imageUrl={item.product.images[0]?.url}
                  personalizationText={item.personalizationText}
                  personalizationImageUrl={item.personalizationImageUrl}
                />
              ))}
            </div>

            <DeliveryAddressSection />
          </div>

          <div className="border rounded-xl bg-white p-5 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">
                Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} item
                {items.reduce((n, i) => n + i.quantity, 0) !== 1 ? "s" : ""})
              </span>
              <Price amountUSD={subtotal} />
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-400">Calculated at checkout</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-4 mb-4">
              <span>Total</span>
              <Price amountUSD={subtotal} />
            </div>
            <button
              disabled
              className="w-full bg-accent-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-accent-600 transition disabled:opacity-50"
              title="Payment integration coming soon"
            >
              Proceed to Pay
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Payment gateway integration coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
