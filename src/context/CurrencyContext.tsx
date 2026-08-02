"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CurrencyCode } from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = "zepzo_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("LKR");

  // Load saved preference on first render (client-only, since localStorage isn't available server-side)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (saved === "LKR" || saved === "USD") {
      setCurrencyState(saved);
    }
  }, []);

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
