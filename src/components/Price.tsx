"use client";

import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";

export default function Price({
  amountUSD,
  className,
}: {
  amountUSD: number | string;
  className?: string;
}) {
  const { currency } = useCurrency();
  return <span className={className}>{formatPrice(Number(amountUSD), currency)}</span>;
}
