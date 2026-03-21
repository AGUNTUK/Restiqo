import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getDictionary, getLocale } from "@/lib/i18n";
import { type ListingWithStats } from "@/lib/types/database";
import { FEATURED_LISTINGS } from "@/lib/constants";
import { Metadata } from "next";
import BookingWidget from "./BookingWidget";
import SinglePropertyMap from "@/components/SinglePropertyMap";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase
    .from("listings_with_stats")
    .select("title, city");
  
  if (isUuid) {
    query = query.or(`id.eq.${slug},slug.eq.${slug}`);
  } else {
    query = query.eq("slug", slug);
  }

  const { data: listing } = await query.single();

  if (!listing) return { title: "Listing Not Found" };

  return {
    title: `${listing.title} in ${listing.city}`,
    description: `Book your stay at ${listing.title} on Restiqa.`,
  };
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const dict = await getDictionary();
  const locale = await getLocale();
  const supabase = await createClient();

  // Fetch listing by slug or ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase
    .from("listings_with_stats")
    .select("*");

  if (isUuid) {
    query = query.or(`id.eq.${slug},slug.eq.${slug}`);
  } else {
    query = query.eq("slug", slug);
  }

  const { data: listingData, error } = await query.single();
  let listing = listingData;

  // Fallback for mock/demo listings
  if (!listing) {
    const mock = FEATURED_LISTINGS.find(f => f.slug === slug || f.id === slug);
    if (mock) {
      listing = mock;
    }
  }

  if (!listing) {
    if (error) console.error("Error fetching listing:", error);
    notFound();
  }

  const l = listing as ListingWithStats;

  // Fetch reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      users (
        name,
        avatar_url
      )
    `)
    .eq("listing_id", l.id)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData || []) as any[];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* 1. Header & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-[#718096]">
        <a href="/" className="hover:text-[#6c63ff] transition-colors">Home</a>
        <span>/</span>
        <a href="/listings" className="hover:text-[#6c63ff] transition-colors">{dict.nav.listings}</a>
        <span>/</span>
        <span className="text-[#2d3748] truncate max-w-[200px]">{l.title}</span>
      </div>

      {/* 2. Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a202c] mb-2 tracking-tight">
            {l.title}
          </h1>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="flex items-center gap-1 text-[#2d3748]">
              <span className="text-[#f6ad55]">★</span> {Number(l.avg_rating).toFixed(1)} 
              <span className="text-[#a0aec0] font-normal">({l.review_count} {dict.listing.reviewsCount})</span>
            </span>
            <span className="text-[#a0aec0]">•</span>
            <span className="text-[#718096] underline decoration-1 underline-offset-4 cursor-pointer hover:text-[#6c63ff] transition-colors">
              {l.location}, {l.city}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="neo-btn px-4 py-2 text-sm flex items-center gap-2">
            <span>📤</span> Share
          </button>
          <button className="neo-btn px-4 py-2 text-sm flex items-center gap-2">
            <span>🤍</span> Save
          </button>
        </div>
      </div>

      {/* 3. Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] mb-12 rounded-[24px] overflow-hidden shadow-lg border border-white/20">
        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden">
          <Image
            src={l.images[0] || "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200"}
            alt={l.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="hidden md:block relative group cursor-pointer overflow-hidden">
          <Image
            src={l.images[1] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
            alt={`${l.title} interior`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="hidden md:block relative group cursor-pointer overflow-hidden">
          <Image
            src={l.images[2] || "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"}
            alt={`${l.title} room`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="hidden md:block relative group cursor-pointer overflow-hidden">
          <Image
            src={l.images[3] || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"}
            alt={`${l.title} view`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="hidden md:block relative group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold z-10 hover:bg-black/30 transition-colors">
            Show all photos
          </div>
          <Image
            src={l.images[4] || l.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
            alt={`${l.title} extra`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-start border-b border-[#e2e8f0] pb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1a202c] mb-1">
                {l.type === 'villa' ? 'Entire Villa' : l.type === 'apartment' ? 'Entire Apartment' : 'Stay'} hosted by {l.host_name || "Admin"}
              </h2>
              <div className="flex gap-2 text-[#718096] font-medium">
                <span>{l.max_guests} {dict.booking.guests}</span> • <span>{l.beds} {l.beds === 1 ? dict.listing.bed : dict.listing.beds}</span> • <span>{l.baths} {l.baths === 1 ? dict.listing.bath : dict.listing.baths}</span>
              </div>
            </div>
            <div className="relative w-14 h-14 rounded-full overflow-hidden neo-shadow-sm border-2 border-white">
              <Image
                src={l.host_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Host"}
                alt="Host avatar"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-bold text-[#1a202c]">Rare find</p>
                <p className="text-sm text-[#718096]">This place is usually fully booked. We recommend booking in advance.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-bold text-[#1a202c]">Verified Stay</p>
                <p className="text-sm text-[#718096]">This property has passed our quality and security checks.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e2e8f0] pt-8">
            <p className="text-[#4a5568] leading-relaxed whitespace-pre-line">
              {l.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="border-t border-[#e2e8f0] pt-8">
            <h3 className="text-xl font-bold text-[#1a202c] mb-6">What this place offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {l.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-4 text-[#2d3748]">
                  <span className="text-xl">
                    {amenity.toLowerCase().includes('wifi') ? '📶' : 
                     amenity.toLowerCase().includes('ac') || amenity.toLowerCase().includes('conditioning') ? '❄️' :
                     amenity.toLowerCase().includes('kitchen') ? '🍳' :
                     amenity.toLowerCase().includes('tv') ? '📺' :
                     amenity.toLowerCase().includes('pool') ? '🏊' :
                     amenity.toLowerCase().includes('parking') ? '🚗' : 
                     amenity.toLowerCase().includes('security') ? '🛡️' : '🔘'}
                  </span>
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Booking Widget */}
        <div className="space-y-6">
          <BookingWidget 
            listingId={l.id} 
            price={l.price} 
            maxGuests={l.max_guests} 
            dict={dict} 
          />
          <div className="text-center p-4 neo-inset rounded-2xl">
            <p className="text-sm font-bold text-[#1a202c] mb-1">Report this listing</p>
            <p className="text-xs text-[#718096]">If you notice anything suspicious or incorrect.</p>
          </div>
        </div>
      </div>

      {/* 5. Location Section */}
      <div className="border-t border-[#e2e8f0] mt-12 pt-12">
        <h3 className="text-2xl font-bold text-[#1a202c] mb-2">{dict.listing.whereYoullBe}</h3>
        <p className="text-[#718096] mb-6 font-medium">{l.location}, {l.city}, {l.country}</p>
        
        {l.latitude && l.longitude ? (
          <SinglePropertyMap lat={l.latitude} lng={l.longitude} title={l.title} />
        ) : (
          <div className="w-full h-[300px] bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 font-medium">
            Location coordinates not available
          </div>
        )}
        
        <div className="mt-8 flex items-start gap-4 p-6 neo-inset rounded-3xl max-w-2xl">
          <div className="text-2xl">🚕</div>
          <div>
            <p className="font-bold text-[#1a202c]">Getting around</p>
            <p className="text-sm text-[#718096]">
              {l.city === 'Sylhet' ? "Sylhet Osmani Airport (ZYL) is about 45 mins away. Local CNGs and rickshaws are easily available." : 
               l.city === 'Cox\'s Bazar' ? "Beach points are within walking distance. Local Tomtoms (electric rickshaws) are the primary transport." :
               "Centrally located with easy access to local transport and popular landmarks."}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Reviews Section */}
      <div className="border-t border-[#e2e8f0] mt-12 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-bold text-[#1a202c] mb-2 flex items-center gap-3">
              <span className="text-[#f6ad55]">★</span>
              {Number(l.avg_rating).toFixed(1)} • {l.review_count} {dict.listing.reviewsCount}
            </h3>
            <p className="text-[#718096] font-medium">Guest feedback and ratings</p>
          </div>
        </div>

        <ReviewList reviews={reviews} dict={dict} />

        <div className="mt-16 max-w-2xl">
          <ReviewForm listingId={l.id} slug={slug} dict={dict} />
        </div>
      </div>
    </div>
  );
}
