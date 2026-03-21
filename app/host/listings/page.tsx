import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Host - My Listings",
  description: "Manage your vacation rentals.",
};

export default async function HostListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select("*, reviews(rating)")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Your Properties</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Manage and track your inventory</p>
        </div>
        <Link href="/host/listings/new" className="neo-btn-primary px-8 py-3 rounded-2xl text-xs font-black shadow-lg">
          + Start a New Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="neo-inset p-20 rounded-[48px] text-center border-2 border-dashed border-white/60">
          <span className="text-7xl mb-6 block drop-shadow-lg">🏡</span>
          <h3 className="text-2xl font-black text-[#1a202c] mb-2 text-shadow-sm">No properties listed yet</h3>
          <p className="text-[#718096] font-medium text-lg mb-8 max-w-md mx-auto">Ready to share your space with the world? <br /> It only takes a few minutes to get started.</p>
          <Link href="/host/listings/new" className="neo-btn-primary px-10 py-4 rounded-3xl text-sm font-black shadow-xl">
             Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => {
            const ratings = listing.reviews?.map((r: any) => r.rating) || [];
            const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

            return (
              <div key={listing.id} className="neo-card p-5 rounded-[32px] group hover:scale-[1.02] transition-all border border-white/40">
                <div className="w-full aspect-video rounded-[24px] overflow-hidden relative mb-5 shadow-inner">
                  <img 
                    src={listing.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 backdrop-blur-md ${
                      listing.status === 'approved' 
                        ? 'bg-[#43e97b]/80 text-white' 
                        : listing.status === 'pending' 
                          ? 'bg-orange-400/80 text-white' 
                          : 'bg-red-500/80 text-white'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                <div className="px-1">
                  <h3 className="text-lg font-black text-[#1a202c] mb-1 line-clamp-1 group-hover:text-[#6c63ff] transition-colors">{listing.title}</h3>
                  <p className="text-xs font-bold text-[#a0aec0] mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                    📍 {listing.city} • {listing.type}
                  </p>
                  
                  <div className="flex gap-4 mb-6 border-b border-white/40 pb-4">
                     <div>
                       <p className="text-[9px] font-black text-[#a0aec0] uppercase tracking-tighter">Earnings</p>
                       <p className="text-sm font-black text-[#1a202c]">৳{Math.round(listing.price)}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-[#a0aec0] uppercase tracking-tighter">Rating</p>
                       <p className="text-sm font-black text-[#1a202c]">⭐ {avgRating.toFixed(1)}</p>
                     </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-3 rounded-2xl bg-white text-[#6c63ff] text-xs font-black shadow-md border border-white/60 hover:shadow-lg transition-all">
                      Edit Listing
                    </button>
                    <Link href={`/listing/${listing.slug}`} className="p-3 rounded-2xl bg-white text-[#a0aec0] hover:text-[#6c63ff] border border-white/60 shadow-md">
                      👁️
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
