import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin - Overview",
  description: "Restiqa Admin Dashboard",
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  
  // Fetch stats concurrently
  const [
    { count: usersCount },
    { count: listingsCount },
    { count: bookingsCount },
    { data: transactions }
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("amount").eq("type", "commission").eq("status", "completed")
  ]);

  const totalRevenue = transactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

  const stats = [
    { label: "Total Users", value: usersCount || 0, icon: "👥", color: "from-[#6c63ff] to-[#8a84ff]" },
    { label: "Total Listings", value: listingsCount || 0, icon: "🏡", color: "from-[#43e97b] to-[#38f9d7]" },
    { label: "Total Bookings", value: bookingsCount || 0, icon: "📆", color: "from-[#fa709a] to-[#fee140]" },
    { label: "Platform Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: "💰", color: "from-[#f6d365] to-[#fda085]" }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Overview</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">At a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 p-6 md:p-0">
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
      
      {/* Visual Chart Placeholder / Recent Activity */}
      <div className="neo-inset p-8 rounded-[32px] text-center max-w-2xl mx-auto mx-6 md:mx-auto">
        <span className="text-5xl mb-4 block">📈</span>
        <h3 className="text-xl font-bold text-[#1a202c] mb-2">Systems Nominal</h3>
        <p className="text-[#718096] font-medium">Platform operations are running smoothly.</p>
      </div>
    </div>
  );
}
