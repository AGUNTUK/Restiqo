import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Host - Earnings",
  description: "Track your revenue and payouts.",
};

export default async function HostEarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch host's properties
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", user.id);

  const listingIds = listings?.map(l => l.id) || [];

  // Fetch bookings with payouts
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      listings ( title )
    `)
    .in("listing_id", listingIds)
    .eq("payment_status", "paid")
    .order("checkout", { ascending: false });

  const totalEarned = bookings?.reduce((sum, b) => sum + (b.host_earnings || (b.total_price * 0.9)), 0) || 0;
  const pendingPayout = bookings?.filter(b => b.payout_status === 'pending').reduce((sum, b) => sum + (b.host_earnings || (b.total_price * 0.9)), 0) || 0;
  const settledPayout = bookings?.filter(b => b.payout_status === 'released').reduce((sum, b) => sum + (b.host_earnings || (b.total_price * 0.9)), 0) || 0;

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Earnings & Payouts</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Financial performance and settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="neo-card p-8 rounded-[32px] border-l-8 border-[#6c63ff] bg-white ring-1 ring-black/5 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#6c63ff] opacity-10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <p className="text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-2">Total Generated</p>
          <h2 className="text-4xl font-black text-[#1a202c]">৳{Math.round(totalEarned).toLocaleString()}</h2>
          <p className="text-[10px] font-bold text-[#a0aec0] mt-4 uppercase">Lifetime earnings share</p>
        </div>
        <div className="neo-card p-8 rounded-[32px] border-l-8 border-orange-400 bg-white ring-1 ring-black/5 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-400 opacity-10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">Pending Release</p>
          <h2 className="text-4xl font-black text-[#1a202c]">৳{Math.round(pendingPayout).toLocaleString()}</h2>
          <p className="text-[10px] font-bold text-[#a0aec0] mt-4 uppercase">In process or upcoming settlements</p>
        </div>
        <div className="neo-card p-8 rounded-[32px] border-l-8 border-[#43e97b] bg-white ring-1 ring-black/5 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#43e97b] opacity-10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <p className="text-xs font-black uppercase tracking-widest text-[#28a745] mb-2">Total Settled</p>
          <h2 className="text-4xl font-black text-[#1a202c]">৳{Math.round(settledPayout).toLocaleString()}</h2>
          <p className="text-[10px] font-bold text-[#a0aec0] mt-4 uppercase">Successfully paid to your account</p>
        </div>
      </div>

      <div className="neo-card rounded-[40px] overflow-hidden border border-white/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Transaction Reference</th>
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Source Property</th>
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Subtotal</th>
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Restiqa Fee (10%)</th>
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Your Share</th>
                <th className="p-7 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0] text-right">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {!bookings || bookings.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-16 text-center text-[#a0aec0] font-medium italic">No financial history yet.</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/40 hover:bg-white/30 transition-colors">
                    <td className="p-7 flex flex-col gap-1">
                      <p className="text-sm font-black text-[#1a202c] tracking-tight">{booking.id.split("-")[0].toUpperCase()}</p>
                      <p className="text-[10px] font-bold text-[#a0aec0]">{new Date(booking.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-7 text-sm font-bold text-[#718096]">{(booking.listings as any)?.title}</td>
                    <td className="p-7 text-sm font-black text-[#1a202c]">৳{Math.round(booking.total_price)}</td>
                    <td className="p-7 text-sm font-bold text-red-500/70">- ৳{Math.round(booking.commission_amount || (booking.total_price * 0.1))}</td>
                    <td className="p-7 text-base font-black text-[#6c63ff]">৳{Math.round(booking.host_earnings || (booking.total_price * 0.9))}</td>
                    <td className="p-7 text-right">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        booking.payout_status === 'released' 
                          ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/20' 
                          : 'bg-orange-50 text-orange-600 border border-orange-200'
                      }`}>
                        {booking.payout_status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
