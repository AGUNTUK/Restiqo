"use client";

import { useFormStatus } from "react-dom";

export default function PaymentSubmitButton({ amount, dict }: { amount: number; dict: any }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`neo-btn neo-btn-primary w-full py-4 rounded-xl font-extrabold text-lg transition-transform ${
        pending ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 active:scale-95"
      }`}
      style={{ boxShadow: "0 10px 25px -5px rgba(108, 99, 255, 0.4)" }}
    >
      {pending ? "Processing..." : `${dict.payment.payNow} • ${dict.common.currency}${amount}`}
    </button>
  );
}
