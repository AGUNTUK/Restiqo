import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { releasePayout } from "@/app/actions/admin";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin - Payouts",
  description: "Manage host payouts securely.",
};

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Simple admin UI to view pending payouts
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      listings ( title, host_id )
    `)
    .eq("payment_status", "paid")
    .eq("payout_status", "pending")
    .order("checkout", { ascending: true });

  const pendingPayouts = bookings || [];
  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Payouts Management</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Admin Dashboard</p>
        </div>
      </div>

      {pendingPayouts.length === 0 ? (
        <div className="neo-inset p-10 rounded-[32px] text-center">
          <span className="text-5xl mb-4 block">💸</span>
          <h3 className="text-xl font-bold text-[#1a202c] mb-2">No pending payouts</h3>
          <p className="text-[#718096] font-medium">All hosts have been paid!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayouts.map((booking) => {
            const checkoutDate = new Date(booking.checkout);
            const isReady = checkoutDate <= today;
            const hostEarnings = booking.host_earnings || (booking.total_price * 0.9);

            return (
              <div key={booking.id} className="neo-card p-6 rounded-[24px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isReady ? (
                       <span className="bg-[#43e97b]/20 text-[#28a745] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">Ready</span>
                    ) : (
                       <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">Waiting</span>
                    )}
                    <span className="text-xs font-bold text-[#a0aec0]">Booking ID: {booking.id.split("-")[0]}</span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#1a202c] mb-1">{booking.listings?.title}</h3>
                  <p className="text-sm text-[#718096] font-medium">Checkout: {checkoutDate.toLocaleDateString()}</p>
                </div>
                
                <div className="sm:text-right w-full sm:w-auto flex flex-col items-start sm:items-end">
                  <p className="text-2xl font-extrabold text-[#6c63ff] mb-2">৳{Math.round(hostEarnings)}</p>
                  <form action={releasePayout}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button 
                      type="submit" 
                      disabled={!isReady}
                      className={`neo-btn px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all w-full sm:w-auto ${
                        isReady 
                          ? "bg-gradient-to-r from-[#43e97b] to-[#38f9d7] text-white shadow-[0_5px_15px_rgba(67,233,123,0.4)]" 
                          : "text-[#a0aec0] opacity-50 cursor-not-allowed"
                      }`}
                    >
                      Release Payout
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
