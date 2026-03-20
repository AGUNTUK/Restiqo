import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type ListingWithStats } from "@/lib/types/database";
import BookingCard from "@/components/BookingCard";
import ListingCard from "@/components/ListingCard";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("id, slug")
    .eq("status", "approved")
    .eq("is_available", true);

  if (!data) return [];

  // Generate params for both ID and Slug to support both URL types
  const params = [];
  for (const item of data) {
    params.push({ id: item.id });
    if (item.slug) {
      params.push({ id: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugOrId } = await params;
  
  if (!isSupabaseConfigured()) return { title: "Listing - Restiqa" };

  const supabase = await createClient();
  
  // Try ID lookup first, then Slug lookup
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);
  
  let query = supabase.from("listings_with_stats").select("title, description, city, country, images, type");
  
  if (isUuid) {
    query = query.eq("id", slugOrId);
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data } = await query.single();

  if (!data) return { title: "Listing Not Found" };

  const seoTitle = `${data.title} in ${data.city} | Restiqa`;
  const seoDescription = data.description 
    ? data.description.substring(0, 160) + "..."
    : `Book this beautiful ${data.type} in ${data.city}, ${data.country} on Restiqa. Premium stays and verified hosts.`;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
      images: data.images?.[0] ? [{ url: data.images[0], width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: data.images?.[0] ? [data.images[0]] : [],
    },
    alternates: {
      canonical: `/listing/${slugOrId}`,
    }
  };
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const { id: slugOrId } = await params;
  const dict = await getDictionary();
  const locale = await getLocale();

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Supabase Not Configured</h1>
        <p className="text-[#718096]">Check your .env.local file to configure credentials.</p>
        <Link href="/listings" className="text-[#6c63ff] font-bold mt-4 inline-block">← Back to listings</Link>
      </div>
    );
  }

  const supabase = await createClient();

  // 1. Fetch listing details by ID or Slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);
  
  let query = supabase.from("listings_with_stats").select("*");
  
  if (isUuid) {
    query = query.eq("id", slugOrId);
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data: listingData, error } = await query.single();

  if (error || !listingData) {
    notFound();
  }

  const listing = listingData as ListingWithStats;

  // 2. Fetch the host's full profile
  const { data: host } = await supabase
    .from("users")
    .select("name, avatar_url, bio")
    .eq("id", listing.host_id)
    .single();

  // 3. Fetch reviews for this listing
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      user_id,
      users ( name, avatar_url )
    `)
    .eq("listing_id", listing.id)
    .order("created_at", { ascending: false });

  // Add type assert since the join shape doesn't perfectly match the raw Review interface
  const reviews = reviewsData as any[] || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 mb-4 text-[#6c63ff] font-bold text-sm no-underline hover:underline"
          style={{ textDecoration: "none" }}
        >
          {dict.listing.backToListings}
        </Link>
        <h1
          className="font-extrabold text-3xl md:text-5xl leading-tight mb-3"
          style={{ color: "#1a202c", letterSpacing: "-0.03em" }}
        >
          {listing.title}
        </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold" style={{ color: "#4a5568" }}>
            <span className="flex items-center gap-1 bg-[#f0fff4] text-[#2f855a] px-3 py-1 rounded-full border border-[#68d391]/30">
              <span className="text-base">🛡️</span> {dict.listing.verified}
            </span>
            <span className="flex items-center gap-1">
              <span style={{ color: "#f6ad55" }}>★</span>
              {Number(listing.avg_rating).toFixed(1)} <span className="underline ml-1">({listing.review_count} {dict.listing.reviewsCount})</span>
            </span>
            <span>·</span>
            <span>
              {listing.city}, {listing.country}
            </span>
          </div>
      </div>

      {/* ── Image Gallery (Grid layout) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 h-[50vh] min-h-[400px]">
        {listing.images.map((img, index) => (
          <div
            key={img}
            className={`relative rounded-3xl overflow-hidden neo-card ${
              index === 0 ? "md:col-span-2 md:row-span-2" : "hidden md:block"
            }`}
          >
            <Image
              src={img}
              alt={`${listing.title} in ${listing.city} - Gallery Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── Main Content (Left) ── */}
        <div className="lg:col-span-2">
          {/* Summary Details */}
          <div className="flex justify-between items-start pb-8 border-b border-[#e2e8f0] mb-8">
            <div>
              <h2 className="font-extrabold text-2xl mb-1 text-[#1a202c]">
                {listing.type.charAt(0).toUpperCase() + listing.type.slice(1)} {dict.listing.hostedBy} {host?.name || "Host"}
              </h2>
              <div className="flex items-center gap-2 text-sm font-bold text-[#68d391] mb-2 uppercase tracking-wider">
                <span className="text-xs">🏆</span> {dict.listing.trusted}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#718096" }}>
                <span>{listing.max_guests} {dict.booking.guests}</span> ·
                <span>{listing.beds} {listing.beds === 1 ? dict.listing.bed : dict.listing.beds}</span> ·
                <span>{listing.baths} {listing.baths === 1 ? dict.listing.bath : dict.listing.baths}</span>
              </div>
            </div>
            {/* Host Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-20 h-20 rounded-full overflow-hidden neo-shadow-sm flex-shrink-0"
                style={{ border: "4px solid #F0F5f9" }}
              >
                <Image
                  src={host?.avatar_url || "https://i.pravatar.cc/150"}
                  alt={`Host ${host?.name || "at Restiqa"}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <a 
                href="tel:+8801700000000" 
                className="neo-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 no-underline"
                style={{ background: "#e8edf2", color: "#6c63ff", boxShadow: "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff" }}
              >
                📞 {dict.listing.callHost}
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="pb-8 border-b border-[#e2e8f0] mb-8">
            <h3 className="font-bold text-xl mb-4 text-[#1a202c]">{dict.listing.about}</h3>
            <p className="whitespace-pre-wrap text-[#4a5568] leading-relaxed text-[15px]">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="pb-8 border-b border-[#e2e8f0] mb-8">
            <h3 className="font-bold text-xl mb-6 text-[#1a202c]">{dict.listing.offers}</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              {listing.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 font-semibold text-[#4a5568]">
                  <span className="text-xl" style={{ opacity: 0.7 }}>
                    {amenity.toLowerCase().includes("pool") ? "🏊" :
                     amenity.toLowerCase().includes("wifi") ? "📶" :
                     amenity.toLowerCase().includes("kitchen") ? "🍳" :
                     amenity.toLowerCase().includes("ac") || amenity.toLowerCase().includes("air conditioning") ? "❄️" : 
                     amenity.toLowerCase().includes("sea") ? "🏖️" :
                     amenity.toLowerCase().includes("hill") ? "⛰️" : "✓"}
                  </span>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <h3 className="font-bold text-2xl text-[#1a202c]">
                <span style={{ color: "#f6ad55" }}>★</span>{" "}
                {Number(listing.avg_rating).toFixed(1)} · {listing.review_count} {dict.listing.reviewsCount}
              </h3>
            </div>
            
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="neo-card-sm p-5 rounded-[20px]">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={rev.users?.avatar_url || "https://i.pravatar.cc/150"}
                        alt={rev.users?.name || "Guest"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#1a202c]">{rev.users?.name || "Guest"}</p>
                        <p className="text-xs text-[#a0aec0]">
                          {new Date(rev.created_at).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[#4a5568] leading-relaxed line-clamp-4">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#a0aec0] font-medium italic">{dict.listing.noReviews}</p>
            )}
          </div>
        </div>

        {/* ── Booking Card (Right) ── */}
        <div className="lg:col-span-1" id="booking-section">
          <BookingCard 
            listingId={listing.id}
            pricePerNight={listing.price}
            maxGuests={listing.max_guests}
            dict={dict}
          />
        </div>
      </div>

      {/* ── Mobile Sticky Footer ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-[#e2e8f0] p-4 flex items-center justify-between lg:hidden z-40 animate-in slide-in-from-bottom duration-500">
        <div>
          <p className="text-xl font-extrabold text-[#1a202c]">
            {dict.common.currency}{listing.price}
            <span className="text-sm font-semibold text-[#718096]"> {dict.common.pricePerNight}</span>
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#f6ad55]">
            <span>★</span> {Number(listing.avg_rating).toFixed(1)}
          </div>
        </div>
        <button 
          onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="neo-btn neo-btn-primary px-8 py-4 rounded-2xl font-extrabold text-sm shadow-lg active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #6c63ff, #ff6584)", color: "#fff" }}
        >
          {dict.booking.reserve}
        </button>
      </div>

      {/* Internal Linking: More in this city */}
      <section className="mt-16 p-8 rounded-[32px] neo-inset text-center border border-white">
        <h2 className="text-xl font-extrabold text-[#1a202c] mb-3">Love {listing.city}?</h2>
        <p className="text-[#718096] font-medium mb-6">Discover more unique stays and travel guides for your next trip to {listing.city}.</p>
        <Link 
          href={`/${listing.city.toLowerCase().replace(/\s+/g, '-')}`}
          className="neo-btn neo-btn-primary px-8 py-3 rounded-xl font-extrabold inline-block no-underline"
        >
          Explore all stays in {listing.city} →
        </Link>
      </section>

      {/* Related Stays */}
      <RelatedStays currentId={listing.id} city={listing.city} dict={dict} />
    </div>
  );
}

async function RelatedStays({ currentId, city, dict }: { currentId: string; city: string; dict: any }) {
  let related: any[] = [];
  
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings_with_stats")
      .select("*")
      .eq("city", city)
      .eq("status", "approved")
      .neq("id", currentId)
      .limit(3);
    
    related = data || [];
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-[#d1d9e0]/50 pt-16">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a202c] mb-8 tracking-tight">
        You might also like...
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {related.map((item) => (
          <ListingCard key={item.id} listing={item} dict={dict} />
        ))}
      </div>
    </section>
  );
}
