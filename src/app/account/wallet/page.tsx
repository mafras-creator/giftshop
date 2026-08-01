import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Wallet</h1>
      <p className="text-sm text-gray-500 mb-6">
        Store credit, refunds, and loyalty balance.
      </p>
      <div className="border rounded-xl bg-white text-center py-16">
        <Wallet size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-400">
          Wallet isn't available yet — this is coming in a future update.
        </p>
      </div>
    </div>
  );
}
