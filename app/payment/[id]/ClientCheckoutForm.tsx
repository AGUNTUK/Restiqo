"use client";

import { useState } from "react";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import PaymentSubmitButton from "./PaymentSubmitButton";

interface ClientCheckoutFormProps {
  bookingId: string;
  amount: number;
  dict: any;
}

export default function ClientCheckoutForm({ bookingId, amount, dict }: ClientCheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      if (data.payment_url) {
        // Redirect to PipraPay checkout gateway
        window.location.href = data.payment_url;
      } else {
        throw new Error("Invalid response received from payment gateway");
      }
    } catch (err: any) {
      console.error("Payment setup error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="w-full">
      <PaymentMethodSelector 
        dict={dict} 
        onSelect={(method) => console.log("Selected method:", method)} 
      />

      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-[#2d3748] mb-2">{dict.payment.ready}</h3>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-sm font-semibold text-red-600 text-center">
            {error}
          </p>
        </div>
      )}

      <PaymentSubmitButton amount={amount} dict={dict} isLoading={loading} />
    </form>
  );
}
