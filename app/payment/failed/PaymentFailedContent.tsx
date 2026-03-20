"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="neo-card max-w-md w-full p-8 md:p-10 rounded-[32px] text-center border-t-4 border-red-500">
        
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-3">Payment Failed</h1>
        
        <p className="text-[#4a5568] mb-8 font-medium">
          We couldn't process your payment. It may have been canceled or declined by your bank or the gateway. Please try again.
        </p>
        
        <div className="flex flex-col gap-4">
          {bookingId ? (
            <Link 
              href={`/payment/${bookingId}`} 
              className="neo-btn w-full block py-4 rounded-xl font-extrabold text-lg text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
            >
              Retry Payment
            </Link>
          ) : (
            <p className="text-sm text-red-500 font-semibold mb-2">No active booking session found to retry.</p>
          )}

          <Link href="/dashboard" className="w-full block py-4 rounded-xl font-bold text-[#4a5568] hover:text-[#2d3748] hover:bg-gray-100 transition-colors">
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
