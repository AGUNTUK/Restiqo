import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminRevenuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all paid bookings for revenue tracking
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      listings ( title )
    `)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });

  if (!bookings) return <div className="p-8 text-center font-bold">No revenue data available.</div>;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
  const pendingPayouts = bookings.filter(b => b.payout_status === 'pending').reduce((sum, b) => sum + (b.host_earnings || 0), 0);
  const releasedPayouts = bookings.filter(b => b.payout_status === 'released').reduce((sum, b) => sum + (b.host_earnings || 0), 0);

  return (
    <div className="p-8 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Platform Revenue</h1>
        <p className="text-[#a0aec0] font-extrabold text-sm tracking-widest uppercase">Financial Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="neo-card p-8 rounded-[32px] border border-white/40">
          <p className="text-xs font-bold text-[#a0aec0] uppercase tracking-widest mb-2">Total Commission</p>
          <p className="text-4xl font-extrabold text-[#6c63ff]">৳{Math.round(totalRevenue).toLocaleString()}</p>
          <div className="mt-4 h-1 w-full bg-[#6c63ff]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#6c63ff] w-[70%]" />
          </div>
        </div>
        <div className="neo-card p-8 rounded-[32px] border border-white/40">
          <p className="text-xs font-bold text-[#a0aec0] uppercase tracking-widest mb-2">Pending Payouts</p>
          <p className="text-4xl font-extrabold text-orange-500">৳{Math.round(pendingPayouts).toLocaleString()}</p>
          <div className="mt-4 h-1 w-full bg-orange-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[45%]" />
          </div>
        </div>
        <div className="neo-card p-8 rounded-[32px] border border-white/40">
          <p className="text-xs font-bold text-[#a0aec0] uppercase tracking-widest mb-2">Released Payouts</p>
          <p className="text-4xl font-extrabold text-[#43e97b]">৳{Math.round(releasedPayouts).toLocaleString()}</p>
          <div className="mt-4 h-1 w-full bg-[#43e97b]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#43e97b] w-[90%]" />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="neo-card rounded-[32px] overflow-hidden border border-white/40">
        <div className="p-6 border-b border-white/20 bg-white/10 flex justify-between items-center">
          <h3 className="font-extrabold text-[#1a202c]">Recent Revenue Transactions</h3>
          <span className="text-xs font-bold text-[#a0aec0] bg-white/40 px-3 py-1 rounded-full uppercase">Live Feed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/30 border-b border-white/50">
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Date</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Listing</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Booking Value</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Commission (10%)</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Host Earnings</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-white/20 hover:bg-white/10 transition-colors">
                  <td className="p-5 text-sm font-bold text-[#718096]">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-5 text-sm font-extrabold text-[#1a202c]">
                    {booking.listings?.title || "Unknown Listing"}
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    ৳{Math.round(booking.total_price).toLocaleString()}
                  </td>
                  <td className="p-5 text-sm font-extrabold text-[#6c63ff]">
                    ৳{Math.round(booking.commission_amount).toLocaleString()}
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    ৳{Math.round(booking.host_earnings).toLocaleString()}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${
                      booking.payout_status === 'released' 
                        ? 'bg-[#43e97b]/20 text-[#28a745]' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {booking.payout_status || "pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
