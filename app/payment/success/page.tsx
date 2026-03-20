"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface BookingDetails {
  id: string;
  total_price: number;
  total_amount?: number;
  payment_status: string;
  listings: {
    title: string;
    city: string;
    images?: string[];
  } | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transaction_id = searchParams.get("transaction_id") || searchParams.get("tran_id");
  const bookingId = searchParams.get("bookingId");

  const [status, setStatus] = useState<"loading" | "verifying" | "success" | "error">("loading");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!transaction_id) {
      setStatus("error");
      setErrorMessage("No transaction ID found in the URL. If you paid, please check your dashboard.");
      return;
    }

    const verifyAndFetch = async () => {
      try {
        setStatus("verifying");
        
        // 1. Verify Payment
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transaction_id }),
        });

        const result = await res.json();

        // Optional: even if verification fails, we can still fetch the booking to see if it was already paid via webhook.
        const orderIdToFetch = result.order_id || bookingId;

        // 2. Fetch Booking Details safely
        if (orderIdToFetch) {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("bookings")
            .select(`
              id, 
              total_price, 
              total_amount, 
              payment_status,
              listings (
                title,
                city,
                images
              )
            `)
            .eq("id", orderIdToFetch)
            .single();

          if (!error && data) {
            setBooking(data as unknown as BookingDetails);
            
            // If the verify endpoint failed but webhook already marked it paid, treat it as success!
            if (data.payment_status === "paid") {
              setStatus("success");
              return;
            }
          }
        }

        if (res.ok && result.success) {
          setStatus("success");
        } else {
          throw new Error(result.error || result.message || "Verification failed");
        }

      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage(err.message || "An error occurred verifying your payment. Please contact support.");
      }
    };

    verifyAndFetch();
  }, [transaction_id, bookingId]);

  if (status === "loading" || status === "verifying") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-[#2d3748] mb-2">Verifying Payment...</h2>
        <p className="text-[#718096]">Please wait while we confirm your transaction securely.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-[#1a202c] mb-4">Payment Unsuccessful</h2>
        <p className="text-[#4a5568] mb-8">{errorMessage}</p>
        <Link href="/dashboard" className="neo-btn neo-btn-primary px-8 py-3 rounded-xl font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // SUCCESS STATE
  const amountPaid = booking?.total_amount || booking?.total_price || "---";
  const propertyTitle = booking?.listings?.title || "Property";
  const propertyCity = booking?.listings?.city || "";
  const propertyImage = booking?.listings?.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="neo-card max-w-md w-full p-8 md:p-10 rounded-[32px] text-center">
        
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Booking Confirmed!</h1>
        <p className="text-[#718096] mb-8 font-medium">Your payment was securely verified.</p>
        
        {/* Receipt Box */}
        <div className="neo-inset p-5 rounded-2xl mb-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>

          <div className="flex gap-4 items-center mb-5 border-b border-[#e2e8f0] pb-5">
            <div className="w-16 h-16 relative rounded-xl overflow-hidden shrink-0">
              <Image src={propertyImage} alt={propertyTitle} fill className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider">{propertyCity}</p>
              <h3 className="font-extrabold text-[#2d3748] leading-tight line-clamp-2">{propertyTitle}</h3>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-[#a0aec0] uppercase tracking-widest mb-1">Amount Paid</p>
              <p className="text-2xl font-extrabold text-[#6c63ff]">৳{amountPaid}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-extrabold uppercase tracking-wide rounded-full">
                Paid
              </span>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="neo-btn neo-btn-primary w-full block py-4 rounded-xl font-extrabold text-lg">
          Go to My Bookings
        </Link>

      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
