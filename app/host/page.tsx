import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Host - Overview",
  description: "Restiqa Host Dashboard",
};

export default async function HostOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Fetch host's listings
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, status")
    .eq("host_id", user.id);

  const listingIds = listings?.map(l => l.id) || [];
  const activeListingsCount = listings?.filter(l => l.status === 'approved').length || 0;

  // 2. Fetch bookings for these listings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      listings ( title )
    `)
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  const totalBookingsCount = bookings?.length || 0;
  const totalEarnings = bookings
    ?.filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.host_earnings || (b.total_price * 0.9)), 0) || 0;

  const upcomingBookings = bookings?.filter(b => new Date(b.checkin) > new Date()).length || 0;

  const stats = [
    { label: "Total Earnings", value: `৳${Math.round(totalEarnings).toLocaleString()}`, icon: "💰", color: "from-[#6c63ff] to-[#8a84ff]" },
    { label: "Active Listings", value: activeListingsCount, icon: "🏡", color: "from-[#43e97b] to-[#38f9d7]" },
    { label: "Total Bookings", value: totalBookingsCount, icon: "📆", color: "from-[#fa709a] to-[#fee140]" },
    { label: "Upcoming Stays", value: upcomingBookings, icon: "✨", color: "from-[#f6d365] to-[#fda085]" }
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight transition-all">Welcome back!</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Your hosting performance at a glance</p>
        </div>
        <Link href="/host/listings/new" className="neo-btn-primary px-6 py-3 rounded-2xl text-sm font-extrabold shadow-lg hover:scale-105 transition-all">
          + Add New Property
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="neo-card p-6 rounded-[24px] relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl filter drop-shadow-sm">{stat.icon}</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-[#a0aec0] mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-[#1a202c]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-lg font-black text-[#1a202c]">Recent Reservations</h3>
            <Link href="/host/bookings" className="text-xs font-bold text-[#6c63ff] hover:underline">View All</Link>
          </div>
          <div className="neo-card rounded-[32px] overflow-hidden border border-white/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/40 border-b border-white/60">
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Dates</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Earning</th>
                  </tr>
                </thead>
                <tbody>
                  {!bookings || bookings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-[#a0aec0] font-medium italic">No bookings yet.</td>
                    </tr>
                  ) : (
                    bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id} className="border-b border-white/40 hover:bg-white/30 transition-colors">
                        <td className="p-5">
                          <p className="text-sm font-black text-[#1a202c] line-clamp-1">{(booking.listings as any)?.title}</p>
                        </td>
                        <td className="p-5">
                          <p className="text-xs font-bold text-[#718096]">{new Date(booking.checkin).toLocaleDateString()} - {new Date(booking.checkout).toLocaleDateString()}</p>
                        </td>
                        <td className="p-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            booking.status === 'confirmed' 
                              ? 'bg-[#43e97b]/10 text-[#28a745]' 
                              : booking.status === 'pending' 
                                ? 'bg-orange-50 text-orange-600' 
                                : 'bg-red-50 text-red-600'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-5 text-sm font-black text-[#6c63ff] text-right">
                          ৳{Math.round(booking.host_earnings || (booking.total_price * 0.9)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Tips / Sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-[#1a202c] px-2">Hosting Tips</h3>
          <div className="neo-card p-6 rounded-[28px] bg-gradient-to-br from-[#6c63ff]/10 to-transparent border border-[#6c63ff]/20">
            <span className="text-2xl mb-2 block">💡</span>
            <p className="text-sm font-bold text-[#1a202c] mb-2 italic">Boost your visibility</p>
            <p className="text-xs font-medium text-[#718096] leading-relaxed">Hosts with professional photos see 40% more bookings. Consider updating your property images!</p>
          </div>
          <div className="neo-inset p-8 rounded-[32px] text-center border border-white/40">
             <p className="text-xs font-black text-[#a0aec0] uppercase tracking-widest mb-4">Support</p>
             <p className="text-sm font-bold text-[#1a202c] mb-1">Need help?</p>
             <p className="text-xs font-medium text-[#718096] mb-4 leading-relaxed">Our support team is available 24/7 for our hosts.</p>
             <button className="w-full py-3 rounded-2xl bg-white text-[#6c63ff] text-xs font-black shadow-md border border-white/60 hover:shadow-lg transition-all">Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
}
