import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updateListingStatus } from "@/app/actions/admin";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin - Listings",
  description: "Listings Moderation Console",
};

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();
  
  // Default to 'pending' if no status is provided, to act as a moderation queue
  const activeStatus = filterStatus || 'pending';
  
  let query = supabase.from("listings").select("*, users(name)").order("created_at", { ascending: false });
  
  if (activeStatus !== 'all') {
    query = query.eq("status", activeStatus);
  }

  const { data: listings } = await query;

  if (!listings) return <div className="p-8">No listings found.</div>;

  const tabs = [
    { name: "Moderation Queue", value: "pending", icon: "🕒" },
    { name: "Approved", value: "approved", icon: "✅" },
    { name: "Rejected", value: "rejected", icon: "❌" },
    { name: "All Properties", value: "all", icon: "🏠" },
  ];

  const getTimeInQueue = (date: string) => {
    const created = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Listing Moderation</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase mb-8">Process approvals and rejections</p>
        
        <div className="flex flex-wrap gap-4">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/listings?status=${tab.value}`}
              className={`px-6 py-3 rounded-[20px] text-xs font-bold transition-all flex items-center gap-2 ${
                activeStatus === tab.value
                  ? "bg-[#6c63ff] text-white shadow-lg neo-shadow-sm scale-105"
                  : "bg-white/50 text-[#718096] hover:bg-white/80"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="neo-card rounded-[32px] overflow-hidden border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property Details</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Host</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Pricing</th>
                {activeStatus === 'pending' && <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Submitted</th>}
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Moderation</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#a0aec0] font-medium italic">
                    No properties found in this category.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="border-b border-white/40 hover:bg-white/30 transition-colors">
                    <td className="p-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative shadow-sm border border-white">
                          <img 
                            src={listing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-[#1a202c] mb-0.5 line-clamp-1">{listing.title}</p>
                          <p className="text-xs font-bold text-[#a0aec0]">{listing.city}, {listing.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm font-bold text-[#4a5568]">
                      {(listing.users as any)?.name || "Unknown"}
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-extrabold text-[#6c63ff]">৳{Math.round(listing.price)}</p>
                      <p className="text-[10px] uppercase font-bold text-[#a0aec0]">per night</p>
                    </td>
                    {activeStatus === 'pending' && (
                      <td className="p-6 text-sm font-bold text-[#718096]">
                        {getTimeInQueue(listing.created_at)}
                      </td>
                    )}
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                        listing.status === 'approved' 
                          ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/20' 
                          : listing.status === 'pending' 
                            ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {listing.status || "approved"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-3 justify-end items-center">
                        <form action={updateListingStatus}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value={listing.status === 'approved' ? 'pending' : 'approved'} />
                          <button 
                            type="submit" 
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                              listing.status === 'approved'
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-[#28a745] hover:bg-[#43e97b]/10 border border-transparent hover:border-[#43e97b]/20"
                            }`}
                          >
                            {listing.status === 'approved' ? 'Re-review' : 'Approve'}
                          </button>
                        </form>
                        {listing.status !== 'rejected' && (
                          <form action={updateListingStatus}>
                            <input type="hidden" name="listingId" value={listing.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <button type="submit" className="px-4 py-2 rounded-xl text-xs font-extrabold text-red-500 hover:bg-red-50 hover:shadow-sm">
                              Reject
                            </button>
                          </form>
                        )}
                        <Link href={`/listing/${listing.slug}`} target="_blank" className="p-2 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                          👁️
                        </Link>
                      </div>
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
