import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddToCartButton from "@/components/AddToCartButton";
import PersonalizeAndAddToCart from "@/components/PersonalizeAndAddToCart";
import ProductGallery from "@/components/ProductGallery";
import Price from "@/components/Price";
import { Sparkles } from "lucide-react";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: params.id },
      include: { images: true, category: true, reviews: true },
    }),
    getServerSession(authOptions),
  ]);

  if (!product) notFound();

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <ProductGallery images={product.images} productName={product.name} />
      <div>
        <p className="text-sm text-gray-500">{product.category.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.isPersonalizable && (
            <span className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-pill shrink-0">
              <Sparkles size={11} />
              Personalized
            </span>
          )}
        </div>
        <Price amountUSD={product.price.toString()} className="text-2xl text-brand-600 font-bold mt-4 block" />
        <p className="text-gray-600 mt-4">{product.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        {product.isPersonalizable ? (
          <PersonalizeAndAddToCart
            productId={product.id}
            inStock={product.stock > 0}
            isLoggedIn={Boolean(session)}
            textEnabled={product.personalizationTextEnabled}
            imageEnabled={product.personalizationImageEnabled}
          />
        ) : (
          <AddToCartButton
            productId={product.id}
            inStock={product.stock > 0}
            isLoggedIn={Boolean(session)}
          />
        )}
      </div>
    </div>
  );
}
