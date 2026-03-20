import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin - Bookings",
  description: "Global Reservations Console",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  
  // Notice: Using explicit relationship hinting might be required if schema ambiguous
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, user_details:users!bookings_user_id_fkey(full_name), listings(title, host_details:users!listings_host_id_fkey(full_name))")
    .order("created_at", { ascending: false });

  if (!bookings) return <div className="p-8">No bookings found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Bookings</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Global Reservations Ledger</p>
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">ID / Date</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Guest & Host</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Property</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Financials</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const checkin = new Date(booking.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const checkout = new Date(booking.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <tr key={booking.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                    <td className="p-5">
                      <p className="text-sm font-extrabold text-[#1a202c] mb-1">{booking.id.split("-")[0]}</p>
                      <p className="text-xs font-bold text-[#718096]">{checkin} - {checkout}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-[#4a5568] mb-1"><span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block">Guest:</span> {(booking.user_details as any)?.full_name || "Unknown"}</p>
                      <p className="text-sm font-bold text-[#4a5568]"><span className="text-[10px] text-[#a0aec0] uppercase tracking-wider block">Host:</span> {((booking.listings as any)?.host_details as any)?.full_name || "Unknown"}</p>
                    </td>
                    <td className="p-5">
                      <Link href={`/listing/${booking.listing_id}`} className="hover:underline">
                        <p className="text-sm font-extrabold text-[#1a202c] line-clamp-1">{(booking.listings as any)?.title}</p>
                      </Link>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-extrabold text-[#6c63ff] mb-1">৳{Math.round(booking.total_amount || booking.total_price)}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${booking.payment_status === 'paid' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.payment_status === 'refunded' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {booking.payment_status || "pending"} Pay
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${booking.status === 'confirmed' ? 'bg-[#43e97b]/20 text-[#28a745]' : booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
