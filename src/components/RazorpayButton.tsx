"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";

export default function RazorpayButton({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate Razorpay window opening and processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="animate-bounce" /> Payment Successful
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-70"
    >
      {loading ? <Loader2 className="animate-spin" /> : <CreditCard />}
      {loading ? "Processing..." : `Pay ₹${amount} with Razorpay`}
    </button>
  );
}
