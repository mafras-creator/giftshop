// All prices in the database are stored in USD.
// This constant converts USD to LKR for display. Update it whenever the
// real exchange rate moves meaningfully - this project does not call a
// live forex API to keep things simple and dependency-free.
export const USD_TO_LKR_RATE = 336;

export type CurrencyCode = "LKR" | "USD";

export function convertFromUSD(amountInUSD: number, currency: CurrencyCode): number {
  if (currency === "LKR") return amountInUSD * USD_TO_LKR_RATE;
  return amountInUSD;
}

export function formatPrice(amountInUSD: number, currency: CurrencyCode): string {
  const converted = convertFromUSD(amountInUSD, currency);

  if (currency === "LKR") {
    // LKR is conventionally shown without decimals, with thousands separators
    return `Rs. ${Math.round(converted).toLocaleString("en-LK")}`;
  }

  return `$${converted.toFixed(2)}`;
}
