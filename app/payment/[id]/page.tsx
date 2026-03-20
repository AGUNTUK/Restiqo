import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { confirmPayment } from "@/app/actions/payment";
import PaymentSubmitButton from "./PaymentSubmitButton";

import { getDictionary, getLocale } from "@/lib/i18n";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const { id } = await params;
  const dict = await getDictionary();
  const locale = await getLocale();

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Supabase Not Configured</h1>
        <p className="text-[#718096]">Check your .env.local file to configure credentials.</p>
        <Link href="/dashboard" className="text-[#6c63ff] font-bold mt-4 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch the 'pending' booking + joined listing info
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      listings (
        title,
        city,
        images
      )
    `)
    .eq("id", id)
    .single();

  if (error || !booking) {
    notFound();
  }

  // 3. Security Check: Only the owner can view and pay for this
  if (booking.user_id !== user.id) {
    notFound();
  }

  if (booking.status === "confirmed") {
    // If they refresh or go back after paying
    redirect("/dashboard");
  }

  const listingTitle = booking.listings?.title || "Property";
  const listingCity = booking.listings?.city || "Destination";
  const listingImage = booking.listings?.images?.[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6";

  const localeCode = locale === "bn" ? "bn-BD" : "en-US";
  const checkinDate = new Date(booking.checkin).toLocaleDateString(localeCode, { month: "short", day: "numeric", year: "numeric" });
  const checkoutDate = new Date(booking.checkout).toLocaleDateString(localeCode, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-[#1a202c] tracking-tight mb-2">{dict.payment.title}</h1>
        <p className="text-[#718096]">{dict.payment.mobileBanking}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Summary Card */}
        <div className="neo-card p-6 md:p-8 rounded-[32px]">
          <h2 className="text-xl font-bold text-[#1a202c] mb-6">{dict.payment.tripSummary}</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
              <Image 
                src={listingImage}
                alt={listingTitle}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 py-1">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#a0aec0] mb-1">{listingCity}</p>
              <h3 className="font-extrabold text-base text-[#2d3748] leading-tight mb-1">{listingTitle}</h3>
              <p className="text-sm font-semibold text-[#6c63ff]">
                {booking.guests_count} {booking.guests_count > 1 ? dict.booking.guests : dict.booking.guest}
              </p>
            </div>
          </div>

          <div className="neo-inset p-4 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#a0aec0] uppercase tracking-wider">{dict.booking.checkIn} / {dict.booking.checkOut}</span>
              <span className="text-[10px] font-bold text-[#2d3748]">{checkinDate} - {checkoutDate}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-t" style={{ borderColor: "#e2e8f0" }}>
              <span className="font-bold text-[#4a5568]">{dict.payment.totalPay}</span>
              <span className="text-xl font-extrabold text-[#1a202c]">{dict.common.currency}{booking.total_price}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="flex flex-col justify-center">
          <form action={async (formData) => { "use server"; await confirmPayment(formData); }} className="w-full">
            <input type="hidden" name="bookingId" value={booking.id} />
            
            <PaymentMethodSelector 
              dict={dict} 
              onSelect={(method) => console.log("Selected method:", method)} 
            />

            <div className="text-center mb-8">
              <h3 className="text-lg font-bold text-[#2d3748] mb-2">{dict.payment.ready}</h3>
            </div>

            <PaymentSubmitButton amount={booking.total_price} dict={dict} />
          </form>

          <p className="text-center text-xs text-[#a0aec0] mt-6 font-semibold">
            {dict.payment.simulated}
          </p>
        </div>

      </div>
    </div>
  );
}
