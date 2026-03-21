import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type ListingWithStats } from "@/lib/types/database";
import ListingCard from "@/components/ListingCard";
import { DynamicListingsMap } from "@/components/LazyWrappers";
import { getDictionary, getLocale } from "@/lib/i18n";
import FilterSection from "@/components/FilterSection";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : null;
  
  return {
    title: city ? `Stays in ${city}` : "Browse All Listings",
    description: city 
      ? `Find the best apartments, villas, and suites to rent in ${city}, Bangladesh.` 
      : "Discover unique stays across Bangladesh. Browse our curated collection of premium properties.",
  };
}

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  let listings: ListingWithStats[] = [];
  const dict = await getDictionary();
  const locale = await getLocale();

  const rawParams = await searchParams;
  const city = typeof rawParams.city === "string" ? rawParams.city : null;
  const guests = typeof rawParams.guests === "string" ? parseInt(rawParams.guests, 10) : null;
  const amenitiesStr = typeof rawParams.amenities === "string" ? rawParams.amenities : null;
  const minPrice = typeof rawParams.minPrice === "string" ? parseInt(rawParams.minPrice, 10) : null;
  const maxPrice = typeof rawParams.maxPrice === "string" ? parseInt(rawParams.maxPrice, 10) : null;
  const type = typeof rawParams.type === "string" ? rawParams.type : null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    let query = supabase
      .from("listings_with_stats")
      .select("*")
      .eq("is_available", true)
      .eq("status", "approved");

    if (city) {
      query = query.or(`city.ilike.%${city}%,location.ilike.%${city}%`);
    }

    if (guests && guests > 0) {
      query = query.gte("max_guests", guests);
    }

    if (minPrice !== null) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte("price", maxPrice);
    }

    if (type && type !== 'all') {
      query = query.eq("type", type);
    }

    if (amenitiesStr) {
      const filters = amenitiesStr.split(",").filter(Boolean);
      if (filters.length > 0) {
        query = query.contains("amenities", filters);
      }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching listings:", error);
    } else if (data) {
      listings = data as ListingWithStats[];
    }
  }

  const hasListings = listings.length > 0;

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative">
        
        {/* Left Side: scrollable Listings */}
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-extrabold text-3xl md:text-4xl mb-3 text-[#1a202c] tracking-tight">
              {city ? `${dict.nav.listings} in ${city}` : dict.nav.listings}
            </h1>
            <p className="text-[#718096] text-lg font-medium">
              {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>

          {/* New Advanced Filter Section */}
          <FilterSection dict={dict} />

          {/* Grid */}
          {hasListings ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-8">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} dict={dict} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="neo-card p-12 rounded-[24px] text-center max-w-xl mx-auto border border-white/40">
              <div className="w-20 h-20 rounded-[24px] shadow-sm flex items-center justify-center text-4xl mx-auto mb-6 neo-inset">
                🌍
              </div>
              <h3 className="font-extrabold text-xl text-[#1a202c] mb-2">
                {dict.listing.noProperties}
              </h3>
              <p className="text-[#718096] mb-6 font-medium">
                {locale === "bn" ? "আপনার ফিল্টারের সাথে মিলে এমন কোনো জায়গা পাওয়া যায়নি।" : "We couldn't find any properties matching your criteria at the moment."}
              </p>
              <a href="/listings" className="neo-btn-primary px-8 py-3 rounded-xl font-extrabold inline-block shadow-lg">
                {locale === "bn" ? "ফিল্টার মুছুন" : "Clear All Filters"}
              </a>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Interactive Map */}
        <div className="hidden lg:block lg:w-[45%] xl:w-[40%] relative">
          <div className="sticky top-24 h-[calc(100vh-140px)] w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/20">
            <DynamicListingsMap listings={listings as ListingWithStats[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
