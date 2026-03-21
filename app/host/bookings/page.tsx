import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Host - Bookings",
  description: "Manage your property reservations.",
};

export default async function HostBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch host's properties first
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", user.id);

  const listingIds = listings?.map(l => l.id) || [];

  // Fetch all bookings for these properties
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      listings ( title ),
      users ( name, email )
    `)
    .in("listing_id", listingIds)
    .order("checkin", { ascending: true });

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Reservations</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Track stays and guest details</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="neo-inset p-20 rounded-[48px] text-center border border-white/40">
           <span className="text-6xl mb-6 block drop-shadow-lg">📅</span>
           <h3 className="text-xl font-black text-[#1a202c] mb-2">No bookings yet</h3>
           <p className="text-[#718096] font-medium text-lg">Your reservation ledger is currently empty.</p>
        </div>
      ) : (
        <div className="neo-card rounded-[32px] overflow-hidden border border-white/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white/40 border-b border-white/60">
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Guest</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Property</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Stay Duration</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0]">Status</th>
                  <th className="p-6 text-xs font-black uppercase tracking-[0.2em] text-[#a0aec0] text-right">Earning</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const checkin = new Date(booking.checkin);
                  const checkout = new Date(booking.checkout);
                  const isActive = today >= checkin && today <= checkout;
                  const isPast = today > checkout;
                  const isUpcoming = today < checkin;

                  return (
                    <tr key={booking.id} className={`border-b border-white/40 hover:bg-white/30 transition-colors ${isActive ? 'bg-blue-50/20' : ''}`}>
                      <td className="p-6">
                        <p className="text-sm font-black text-[#1a202c]">{(booking.users as any)?.name || "Guest"}</p>
                        <p className="text-[10px] font-bold text-[#a0aec0]">{(booking.users as any)?.email}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-black text-[#1a202c]">{(booking.listings as any)?.title}</p>
                        <p className="text-[10px] font-bold text-[#a0aec0]">ID: {booking.id.split("-")[0]}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-bold text-[#1a202c]">{checkin.toLocaleDateString()} - {checkout.toLocaleDateString()}</p>
                          <div className="flex items-center gap-2">
                            {isActive && <span className="w-2 h-2 rounded-full bg-[#6c63ff] animate-pulse"></span>}
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#6c63ff]' : 'text-[#a0aec0]'}`}>
                              {isActive ? "Currently Staying" : isPast ? "Past Stay" : "Upcoming Stay"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          booking.status === 'confirmed' 
                            ? 'bg-[#43e97b]/10 text-[#28a745] border border-[#43e97b]/20' 
                            : booking.status === 'pending' 
                              ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                              : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <p className="text-base font-black text-[#6c63ff]">৳{Math.round(booking.host_earnings || (booking.total_price * 0.9)).toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-[#a0aec0] uppercase tracking-tighter">{booking.payout_status === 'released' ? 'Settled' : 'Unreleased'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
