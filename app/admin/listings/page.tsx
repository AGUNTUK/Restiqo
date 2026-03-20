import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { updateListingStatus } from "@/app/actions/admin";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin - Listings",
  description: "Listings Moderation Console",
};

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase.from("listings").select("*, users(full_name)").order("created_at", { ascending: false });

  if (!listings) return <div className="p-8">No listings found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Listings</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Property Moderation</p>
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Host</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Pricing</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                  <td className="p-5">
                    <div className="flex gap-4 items-center">
                       <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative shadow-sm">
                         <img 
                           src={listing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                           alt={listing.title}
                           className="w-full h-full object-cover"
                         />
                       </div>
                       <div>
                         <Link href={`/listing/${listing.id}`} className="hover:underline">
                           <p className="font-extrabold text-sm text-[#1a202c] line-clamp-1">{listing.title}</p>
                         </Link>
                         <p className="text-xs font-bold text-[#a0aec0] mt-1">{listing.city}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    {(listing.users as any)?.full_name || "Unknown"}
                  </td>
                  <td className="p-5 text-sm font-extrabold text-[#6c63ff]">
                    ৳{Math.round(listing.price)}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${listing.status === 'approved' ? 'bg-[#43e97b]/20 text-[#28a745]' : listing.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                      {listing.status || "approved"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2 justify-end">
                      {listing.status !== 'approved' && (
                        <form action={updateListingStatus}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="approved" />
                          <button type="submit" className="text-xs font-bold text-[#28a745] hover:bg-[#43e97b]/10 hover:shadow-sm transition-all px-3 py-2 rounded-xl">Approve</button>
                        </form>
                      )}
                      {listing.status !== 'rejected' && (
                        <form action={updateListingStatus}>
                          <input type="hidden" name="listingId" value={listing.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" className="text-xs font-bold text-red-500 hover:bg-red-50 hover:shadow-sm transition-all px-3 py-2 rounded-xl">Reject</button>
                        </form>
                      )}
                    </div>
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
