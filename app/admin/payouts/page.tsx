import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { releasePayout } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin - Payouts",
  description: "Manage host payouts securely.",
};

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  let readyTotal = 0;
  let waitingTotal = 0;

  pendingPayouts.forEach(b => {
    const earnings = b.host_earnings || (b.total_price * 0.9);
    const checkoutDate = new Date(b.checkout);
    if (checkoutDate <= today) {
      readyTotal += earnings;
    } else {
      waitingTotal += earnings;
    }
  });

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Host Payouts</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase mb-10">Financial Disbursement Console</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="neo-card p-8 rounded-[32px] border-l-8 border-[#43e97b] bg-green-50/20 relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#43e97b] opacity-5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
             <p className="text-xs font-black uppercase tracking-[0.2em] text-[#28a745] mb-2">Ready to Release</p>
             <h2 className="text-4xl font-black text-[#1a202c]">৳{Math.round(readyTotal).toLocaleString()}</h2>
             <p className="text-[10px] font-bold text-[#a0aec0] mt-4 uppercase">Funds from completed stays</p>
          </div>
          <div className="neo-card p-8 rounded-[32px] border-l-8 border-orange-400 bg-orange-50/10 relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-400 opacity-5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
             <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 mb-2">Awaiting Completion</p>
             <h2 className="text-4xl font-black text-[#1a202c]">৳{Math.round(waitingTotal).toLocaleString()}</h2>
             <p className="text-[10px] font-bold text-[#a0aec0] mt-4 uppercase">Ongoing or upcoming stays</p>
          </div>
        </div>
      </div>

      {pendingPayouts.length === 0 ? (
        <div className="neo-inset p-16 rounded-[48px] text-center border-2 border-dashed border-white/40">
          <span className="text-7xl mb-6 block drop-shadow-lg">✨</span>
          <h3 className="text-2xl font-black text-[#1a202c] mb-2">Ledger is balanced</h3>
          <p className="text-[#718096] font-medium text-lg">Every host has been settled. No pending actions.</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center px-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-[#a0aec0]">Outstanding Settlements</h4>
             <span className="text-xs font-bold text-[#a0aec0] bg-white/50 px-3 py-1 rounded-full border border-white/40">
               {pendingPayouts.length} items
             </span>
          </div>
          {pendingPayouts.map((booking) => {
            const checkoutDate = new Date(booking.checkout);
            const isReady = checkoutDate <= today;
            const hostEarnings = booking.host_earnings || (booking.total_price * 0.9);

            return (
              <div key={booking.id} className={`neo-card p-6 md:p-8 rounded-[32px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/40 transition-all hover:translate-y-[-2px] hover:shadow-xl ${isReady ? 'ring-2 ring-[#43e97b]/10' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {isReady ? (
                       <span className="bg-[#43e97b]/10 text-[#28a745] px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#43e97b]/20">Verified Ready</span>
                    ) : (
                       <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-orange-100 italic">In-Progress</span>
                    )}
                    <span className="text-xs font-bold text-[#a0aec0] opacity-60">REF: {booking.id.split("-")[0]}</span>
                  </div>
                  <h3 className="font-black text-xl text-[#1a202c] mb-1 leading-tight">{booking.listings?.title}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#718096]">
                    <p className="flex items-center gap-1">📅 Checkout: {checkoutDate.toLocaleDateString()}</p>
                    <p className="flex items-center gap-1">🆔 Host ID: {booking.listings?.host_id?.split("-")[0]}</p>
                  </div>
                </div>
                
                <div className="sm:text-right w-full sm:w-auto flex flex-col items-start sm:items-end gap-1 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/20">
                  <p className="text-[10px] font-black text-[#a0aec0] uppercase tracking-widest">To be released</p>
                  <p className="text-3xl font-black text-[#6c63ff] mb-4">৳{Math.round(hostEarnings).toLocaleString()}</p>
                  <form action={releasePayout}>
                    <input type="hidden" name="bookingId" value={booking.id} />
                    <button 
                      type="submit" 
                      disabled={!isReady}
                      className={`px-8 py-3 rounded-2xl text-sm font-black transition-all w-full sm:w-auto ${
                        isReady 
                          ? "bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95" 
                          : "bg-white/50 text-[#a0aec0] cursor-not-allowed grayscale"
                      }`}
                    >
                      Process Payout
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
