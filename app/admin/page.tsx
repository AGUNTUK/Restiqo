import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin - Overview",
  description: "Restiqa Admin Dashboard",
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch stats concurrently
  const [
    { count: usersCount },
    { count: listingsCount },
    { count: bookingsCount },
    { data: transactions },
    { count: pendingListingsCount },
    { data: readyPayouts }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("amount").eq("type", "commission").eq("status", "completed"),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("id").eq("payout_status", "pending").lte("checkout", today)
  ]);

  const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
  const readyPayoutCount = readyPayouts?.length || 0;

  const stats = [
    { label: "Total Users", value: usersCount || 0, icon: "👥", color: "from-[#6c63ff] to-[#8a84ff]" },
    { label: "Total Listings", value: listingsCount || 0, icon: "🏡", color: "from-[#43e97b] to-[#38f9d7]" },
    { label: "Total Bookings", value: bookingsCount || 0, icon: "📆", color: "from-[#fa709a] to-[#fee140]" },
    { label: "Platform Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: "💰", color: "from-[#f6d365] to-[#fda085]" }
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">System Overview</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Real-time performance metrics</p>
      </div>

      {/* Action Alerts Section */}
      {(pendingListingsCount! > 0 || readyPayoutCount > 0) && (
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingListingsCount! > 0 && (
            <Link href="/admin/listings?status=pending" className="neo-card p-6 rounded-[28px] border-l-4 border-orange-400 bg-orange-50/30 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div>
                <p className="text-orange-600 font-extrabold text-sm uppercase tracking-wider mb-1">Attention Required</p>
                <h3 className="text-xl font-bold text-[#1a202c]">{pendingListingsCount} Pending Listings</h3>
                <p className="text-sm text-[#718096]">Properties awaiting moderation</p>
              </div>
              <span className="text-3xl group-hover:translate-x-1 transition-transform">➡️</span>
            </Link>
          )}
          {readyPayoutCount > 0 && (
            <Link href="/admin/payouts" className="neo-card p-6 rounded-[28px] border-l-4 border-[#43e97b] bg-green-50/30 flex items-center justify-between group hover:scale-[1.02] transition-all">
              <div>
                <p className="text-[#28a745] font-extrabold text-sm uppercase tracking-wider mb-1">Ready for Action</p>
                <h3 className="text-xl font-bold text-[#1a202c]">{readyPayoutCount} Payouts Ready</h3>
                <p className="text-sm text-[#718096]">Funds eligible for host release</p>
              </div>
              <span className="text-3xl group-hover:translate-x-1 transition-transform">➡️</span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="neo-card p-6 rounded-[24px] relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl filter drop-shadow-sm">{stat.icon}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-[#1a202c]">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="neo-inset p-10 rounded-[40px] text-center max-w-2xl mx-auto neo-shadow-sm">
        <span className="text-6xl mb-6 block">🚀</span>
        <h3 className="text-2xl font-bold text-[#1a202c] mb-2">Platform Status: Active</h3>
        <p className="text-[#718096] font-medium leading-relaxed">
          All systems are performing within normal parameters. <br />
          Restiqa is serving guests and hosts securely.
        </p>
      </div>
    </div>
  );
}
