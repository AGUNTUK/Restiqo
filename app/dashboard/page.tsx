import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { deleteListing, addPayoutMethod } from "@/app/actions/host";
import { updateBookingStatus, cancelBooking } from "@/app/actions/booking";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your Restiqa bookings and account.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "traveler";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Traveller";

  const initial = displayName.charAt(0).toUpperCase();

  const joinedAt = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const quickLinks = [
    { href: "/listings", icon: "🔍", label: "Browse Listings", sub: "Find your next stay" },
    { href: "#", icon: "❤️", label: "Saved Listings", sub: "Properties you liked" },
    { href: "#", icon: "⚙️", label: "Account Settings", sub: "Manage your profile" },
  ];

  /* -------------------------------------------------------------------------- */
  /*                             TRAVELER DATA FETCH                            */
  /* -------------------------------------------------------------------------- */
  let bookings: any[] = [];
  if (isSupabaseConfigured() && user && tab === "traveler") {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id,
        checkin,
        checkout,
        guests_count,
        total_price,
        status,
        listings (
          id,
          title,
          city,
          images
        )
      `)
      .eq("user_id", user.id)
      .order("checkin", { ascending: false });
    
    if (data) bookings = data;
  }

  /* -------------------------------------------------------------------------- */
  /*                                HOST DATA FETCH                             */
  /* -------------------------------------------------------------------------- */
  let myProperties: any[] = [];
  let hostBookings: any[] = [];
  let myPayoutMethods: any[] = [];
  let totalEarnings = 0;
  let monthlyEarnings = 0;
  let completedPayoutEarnings = 0;
  let pendingEarnings = 0;

  // Chart Data Preparation: last 6 months
  const now = new Date();
  const monthsData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
       label: d.toLocaleDateString('en-US', { month: 'short' }),
       month: d.getMonth(),
       year: d.getFullYear(),
       earnings: 0
    };
  }).reverse();

  if (isSupabaseConfigured() && user && tab === "host") {
    // 1. Fetch user's own properties
    const { data: properties } = await supabase
      .from("listings")
      .select("id, title, city, price, images")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false });
    
    if (properties) myProperties = properties;

    // Fetch payout methods
    const { data: payoutMethods } = await supabase
      .from("payout_methods")
      .select("*")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false });
    if (payoutMethods) myPayoutMethods = payoutMethods;

    // 2. If user has properties, get the bookings for those properties
    if (myProperties.length > 0) {
      const listingIds = myProperties.map((l) => l.id);
      
      const { data: bData } = await supabase
        .from("bookings")
        .select(`
          id,
          checkin,
          checkout,
          guests_count,
          total_price,
          host_earnings,
          status,
          user_id,
          listing_id,
          payout_status
        `)
        .in("listing_id", listingIds)
        .order("checkin", { ascending: false });

      if (bData) {
        // Calculate earnings & map listings back to bookings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        hostBookings = bData.map((b) => {
          const earnings = b.host_earnings || (b.total_price * 0.9);

          if (b.status === "confirmed") {
            totalEarnings += earnings;
            const checkinDate = new Date(b.checkin);
            if (checkinDate.getMonth() === currentMonth && checkinDate.getFullYear() === currentYear) {
              monthlyEarnings += earnings;
            }
            if (b.payout_status === "released") {
              completedPayoutEarnings += earnings;
            }
            
            // Push to chart data
            const match = monthsData.find(m => m.month === checkinDate.getMonth() && m.year === checkinDate.getFullYear());
            if (match) match.earnings += earnings;
          }
          if (b.status === "pending") pendingEarnings += earnings;

          return {
            ...b,
            listings: myProperties.find((l) => l.id === b.listing_id),
          };
        });
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* ── Header ── */}
      <div className="neo-card rounded-[20px] p-7 mb-7 flex items-center gap-5 flex-wrap">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #6c63ff, #ff6584)",
            boxShadow: "4px 4px 14px rgba(108,99,255,0.35)",
          }}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#a0aec0" }}>
            Welcome back
          </p>
          <h1
            className="font-extrabold text-2xl leading-tight truncate"
            style={{ color: "#1a202c", letterSpacing: "-0.02em" }}
          >
            {displayName}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#a0aec0" }}>
            {user.email} · Member since {joinedAt}
          </p>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="neo-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-[#e53e3e]"
          >
             Sign Out
          </button>
        </form>
      </div>

      {/* ── Segmented Tab Control ── */}
      <div className="neo-inset p-2 rounded-2xl flex gap-2 mb-8 mx-auto w-full max-w-sm">
        <Link 
          href="?tab=traveler" 
          className={`flex-1 text-center py-3 rounded-xl font-bold text-sm transition-all focus:outline-none ${tab === "traveler" ? "neo-card text-[#6c63ff] shadow-[4px_4px_10px_#c4c9ce,-4px_-4px_10px_#ffffff]" : "text-[#718096] hover:bg-black/5"}`}
        >
          Traveler
        </Link>
        <Link 
          href="?tab=host" 
           className={`flex-1 text-center py-3 rounded-xl font-bold text-sm transition-all focus:outline-none ${tab === "host" ? "neo-card text-[#ff6584] shadow-[4px_4px_10px_#c4c9ce,-4px_-4px_10px_#ffffff]" : "text-[#718096] hover:bg-black/5"}`}
        >
          Host
        </Link>
      </div>

      {/* ========================================================================= */}
      {/*                               TRAVELER TAB                                */}
      {/* ========================================================================= */}
      {tab === "traveler" && (
        <div className="animate-in fade-in duration-500">
          {/* Account info card */}
          <div className="neo-card rounded-[20px] p-7 mb-7">
            <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Account Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Email", value: user.email ?? "—" },
                { label: "User ID", value: user.id.slice(0, 18) + "…" },
                { label: "Email Confirmed", value: user.email_confirmed_at ? "✅ Verified" : "⚠️ Pending confirmation" },
                { label: "Auth Provider", value: user.app_metadata?.provider ?? "email" },
              ].map(({ label, value }) => (
                <div key={label} className="neo-card-sm p-4 rounded-xl">
                  <p className="text-xs font-bold uppercase tracking-wide mb-1 text-[#a0aec0]">{label}</p>
                  <p className="text-sm font-semibold truncate text-[#2d3748]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Trips */}
          <div className="mb-7">
            <h2 className="font-bold text-lg mb-4 text-[#1a202c]">My Trips</h2>
            {bookings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="neo-card rounded-[20px] p-4 flex flex-col sm:flex-row gap-4 no-underline group transition-transform"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 relative">
                      <Image
                        src={booking.listings.images[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                        alt={booking.listings.title}
                        fill
                        sizes="(max-width: 640px) 100px, 150px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm uppercase">
                        {booking.status}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/listing/${booking.listings.id}`} className="hover:underline">
                          <h3 className="font-extrabold text-sm sm:text-base truncate text-[#1a202c] mb-1">{booking.listings.title}</h3>
                        </Link>
                        <p className="text-xs text-[#718096] mb-2 truncate">{booking.listings.city}</p>
                        <p className="text-xs font-bold text-[#4a5568]">
                          {new Date(booking.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(booking.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#a0aec0] tracking-wider block mb-0.5">
                            {booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}
                          </span>
                          <span className="text-sm font-extrabold text-[#6c63ff]">৳{Math.round(booking.total_price)}</span>
                        </div>
                        {(booking.status === "pending" || booking.status === "confirmed") && (
                          <form action={cancelBooking}>
                            <input type="hidden" name="bookingId" value={booking.id} />
                            <button type="submit" className="neo-btn px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:underline">
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neo-inset p-8 rounded-[20px] text-center w-full">
                <div className="text-4xl mb-4">✈️</div>
                <h3 className="text-lg font-bold text-[#1a202c] mb-2">No trips booked... yet!</h3>
                <p className="text-sm text-[#718096] mb-6">Time to dust off your bags and start planning your next adventure.</p>
                <Link href="/listings" className="neo-btn neo-btn-primary px-6 py-2.5 rounded-xl font-bold text-sm inline-block">Start exploring</Link>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Quick Links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map(({ href, icon, label, sub }) => (
                <Link key={label} href={href} className="neo-card rounded-[16px] p-5 flex items-center gap-4 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-[3px_3px_10px_rgba(108,99,255,0.3)] bg-gradient-to-br from-[#6c63ff] to-[#ff6584]">
                    {icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1a202c]">{label}</p>
                    <p className="text-xs text-[#a0aec0]">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/*                                  HOST TAB                                 */}
      {/* ========================================================================= */}
      {tab === "host" && (
        <div className="animate-in fade-in duration-500">
          
          {/* Earnings Summary */}
          <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="neo-card p-6 rounded-[24px]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Total Earned</p>
              <p className="text-3xl font-extrabold text-[#6c63ff]">৳{totalEarnings.toLocaleString()}</p>
            </div>
            <div className="neo-card p-6 rounded-[24px]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Completed Payouts</p>
              <p className="text-3xl font-extrabold text-[#43e97b]">৳{completedPayoutEarnings.toLocaleString()}</p>
            </div>
            <div className="neo-inset p-6 rounded-[24px]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Pending</p>
              <p className="text-3xl font-extrabold text-[#718096]">৳{pendingEarnings.toLocaleString()}</p>
            </div>
          </div>

          {/* Earnings Chart */}
          <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Earnings History (6 Months)</h2>
          <div className="neo-inset p-6 rounded-[24px] mb-8 flex justify-between items-end gap-2 sm:gap-4 h-56 pt-12 overflow-x-auto relative mx-auto w-full max-w-lg">
            {monthsData.map((m) => {
               const maxEarning = Math.max(...monthsData.map(m => m.earnings), 1);
               const heightPct = (m.earnings / maxEarning) * 100;
               return (
                 <div key={`${m.month}-${m.year}`} className="flex-1 flex flex-col justify-end items-center h-full group">
                   <div className="w-full max-w-[40px] rounded-[10px] transition-all duration-500 bg-gradient-to-t from-[#6c63ff]/80 to-[#ff6584]/80 group-hover:from-[#6c63ff] group-hover:to-[#ff6584] relative flex justify-center shadow-[4px_4px_10px_#c4c9ce,-4px_-4px_10px_#ffffff]" style={{ height: `${heightPct}%`, minHeight: '8px' }}>
                     <span className="absolute -top-7 text-[10px] font-bold text-[#4a5568] opacity-0 group-hover:opacity-100 transition-opacity">৳{Math.round(m.earnings)}</span>
                   </div>
                   <span className="text-[10px] sm:text-xs font-extrabold uppercase text-[#a0aec0] mt-3 whitespace-nowrap tracking-wider">{m.label}</span>
                 </div>
               )
            })}
          </div>

          {/* Payout Methods */}
          <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Payout Methods</h2>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             {myPayoutMethods.length > 0 ? myPayoutMethods.map((pm: any) => (
               <div key={pm.id} className="neo-card p-5 rounded-[20px] flex justify-between items-center transition-all hover:-translate-y-1">
                 <div>
                   <p className="text-sm font-extrabold text-[#1a202c] mb-1">{pm.provider}</p>
                   <p className="text-xs font-bold text-[#718096]">{pm.account_details}</p>
                 </div>
                 {pm.is_default && <span className="text-[10px] font-extrabold uppercase bg-white/70 shadow-sm text-[#6c63ff] px-3 py-1.5 rounded-full backdrop-blur-md">Primary</span>}
               </div>
             )) : (
               <div className="neo-inset p-5 rounded-[20px] text-center col-span-full">
                 <p className="text-sm text-[#718096] mb-2 font-medium">No payout methods added.</p>
               </div>
             )}
             
             {/* Add New Method Form */}
             <form action={addPayoutMethod} className="neo-inset p-5 rounded-[20px] col-span-full mt-2">
               <h3 className="text-sm font-extrabold text-[#1a202c] mb-4">Add Payout Method</h3>
               <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                 <select name="provider" className="neo-card rounded-[14px] px-4 py-3 text-sm font-bold bg-transparent focus:outline-none flex-1" required>
                   <option value="">Select Provider</option>
                   <option value="bKash">bKash</option>
                   <option value="Nagad">Nagad</option>
                   <option value="Bank">Bank Account</option>
                 </select>
                 <input type="text" name="account_details" placeholder="Account Details (e.g. Number)" className="neo-inset rounded-[14px] px-4 py-3 text-sm font-bold bg-transparent focus:outline-none flex-[2]" required />
                 <button type="submit" className="neo-btn px-6 py-3 rounded-[14px] text-sm font-extrabold text-[#6c63ff] whitespace-nowrap shadow-sm">Save Details</button>
               </div>
             </form>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-[#1a202c]">My Listings</h2>
            <Link href="/dashboard/add-listing" className="neo-btn neo-btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm inline-block">
               + Add Listing
            </Link>
          </div>

          {/* My Listings List */}
          <div className="mb-8">
            {myProperties.length > 0 ? (
              <div className="space-y-4">
                {myProperties.map((property) => (
                  <div key={property.id} className="neo-card rounded-[20px] p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex gap-4 flex-1">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                        <Image
                          src={property.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6"}
                          alt={property.title}
                          fill
                          sizes="80px"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-[#43e97b] text-white px-1.5 py-0.5 rounded-full text-[8px] font-extrabold shadow-sm uppercase">
                          LIVE
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                        <Link href={`/listing/${property.id}`} className="hover:underline">
                          <h3 className="font-extrabold text-sm truncate text-[#1a202c] mb-1">{property.title}</h3>
                        </Link>
                        <p className="text-xs text-[#718096] mb-1 truncate">📍 {property.city}</p>
                        <p className="text-sm font-extrabold text-[#1a202c]">
                          ৳{Math.round(property.price)} <span className="text-[10px] font-semibold text-[#a0aec0]">/ night</span>
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-[#e2e8f0]/40 pt-3 sm:pt-0 sm:pl-3">
                      <Link href={`/dashboard/edit-listing/${property.id}`} className="neo-btn px-4 py-2 rounded-xl font-bold text-xs text-[#6c63ff] flex-1 text-center items-center justify-center flex hover:underline">
                        Edit
                      </Link>
                      <form action={deleteListing} className="flex-1 flex">
                        <input type="hidden" name="id" value={property.id} />
                        <button type="submit" className="neo-btn px-4 py-2 rounded-xl font-bold text-xs text-red-500 w-full hover:underline disabled:opacity-50">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neo-inset p-8 rounded-[24px] text-center w-full">
                <span className="text-4xl mb-3 block">🏡</span>
                <h3 className="text-sm font-bold text-[#1a202c] mb-1">No listings yet</h3>
                <p className="text-xs text-[#718096] mb-4">Start earning by listing your space on Restiqa.</p>
                <Link href="/dashboard/add-listing" className="neo-btn neo-btn-primary px-6 py-2.5 rounded-xl font-bold text-sm inline-block">
                  Create Listing
                </Link>
              </div>
            )}
          </div>

          {/* Guest Bookings on Host's Properties */}
          <h2 className="font-bold text-lg mb-4 text-[#1a202c]">Reservations</h2>
          {hostBookings.length > 0 ? (
            <div className="space-y-4">
              {hostBookings.map((booking) => (
                 <div key={booking.id} className="neo-card rounded-[20px] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${booking.status === 'confirmed' ? 'bg-[#43e97b]/20 text-[#28a745]' : 'bg-orange-100 text-orange-600'}`}>
                        {booking.status}
                      </span>
                      <p className="text-xs font-bold text-[#a0aec0]">Booking ID: {booking.id.split("-")[0]}</p>
                    </div>
                    <h3 className="font-extrabold text-sm text-[#1a202c] mb-1">
                       {booking.listings?.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#4a5568]">
                       {new Date(booking.checkin).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(booking.checkout).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {booking.guests_count} Guests
                    </p>
                  </div>
                  <div className="md:text-right shrink-0">
                    <p className="text-sm font-extrabold text-[#6c63ff] mb-1">৳{Math.round(booking.host_earnings || (booking.total_price * 0.9))}</p>
                    <p className="text-xs font-bold text-[#a0aec0] mb-3">Guest ID: {booking.user_id?.substring(0, 6).toUpperCase()}</p>
                    {booking.status === "pending" && (
                      <div className="flex gap-2 justify-end">
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <button type="submit" className="neo-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#28a745] hover:underline">Accept</button>
                        </form>
                        <form action={updateBookingStatus}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <button type="submit" className="neo-btn px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:underline">Reject</button>
                        </form>
                      </div>
                    )}
                  </div>
                 </div>
              ))}
            </div>
          ) : (
            <div className="neo-inset p-8 rounded-[24px] text-center w-full">
               <span className="text-3xl mb-3 block">🛎️</span>
               <p className="text-sm text-[#718096] font-medium">No reservations received yet.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
