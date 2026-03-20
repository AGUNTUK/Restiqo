import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type ListingWithStats } from "@/lib/types/database";
import ListingCard from "@/components/ListingCard";
import { DynamicListingsMap } from "@/components/LazyWrappers";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

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

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

import { getDictionary, getLocale } from "@/lib/i18n";

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  let listings: ListingWithStats[] = [];
  const dict = await getDictionary();
  const locale = await getLocale();

  const rawParams = await searchParams;
  const city = typeof rawParams.city === "string" ? rawParams.city : null;
  const guests = typeof rawParams.guests === "string" ? parseInt(rawParams.guests, 10) : null;
  const amenitiesStr = typeof rawParams.amenities === "string" ? rawParams.amenities : null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    let query = supabase
      .from("listings_with_stats")
      .select("*")
      .eq("is_available", true)
      .eq("status", "approved");

    if (city) {
      // Basic text match for city or location
      query = query.or(`city.ilike.%${city}%,location.ilike.%${city}%`);
    }

    if (guests && guests > 0) {
      query = query.gte("max_guests", guests);
    }

    if (amenitiesStr) {
      const filters = amenitiesStr.split(",").filter(Boolean);
      // Ensure all requested amenities exist in the array
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
            <h1
              className="font-extrabold text-3xl md:text-4xl mb-3"
              style={{ color: "#1a202c", letterSpacing: "-0.03em" }}
            >
              {dict.nav.listings}
            </h1>
            <p className="text-[#718096] text-lg font-medium">
              {dict.hero.subtitle}
            </p>
          </div>

          {/* Filter strip */}
          <div
            className="neo-inset rounded-2xl p-4 mb-8 flex gap-3 overflow-x-auto hide-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            {["All", "Villas", "Apartments", "Studios", "Penthouses"].map((filter, i) => (
              <button
                key={filter}
                className="px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
                style={
                  i === 0
                    ? {
                        background: "#e8edf2",
                        color: "#6c63ff",
                        boxShadow: "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff",
                      }
                    : {
                        background: "transparent",
                        color: "#718096",
                      }
                }
              >
                {i === 1 ? "🌴" : i === 2 ? "🏙️" : i === 3 ? "🎨" : i === 4 ? "🌆" : "🏠"}{" "}
                {filter}
              </button>
            ))}
          </div>

          {/* Grid */}
          {hasListings ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 pb-8">
              {(listings as ListingWithStats[]).map((listing) => (
                <ListingCard key={listing.id} listing={listing} dict={dict} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="neo-card p-12 rounded-[24px] text-center max-w-xl mx-auto">
              <div
                className="w-20 h-20 rounded-[20px] shadow-sm flex items-center justify-center text-4xl mx-auto mb-6"
                style={{
                  background: "linear-gradient(135deg, #e8edf2, #ffffff)",
                  boxShadow: "inset 4px 4px 10px #c4c9ce, inset -4px -4px 10px #ffffff",
                }}
              >
                🌍
              </div>
              <h3 className="font-extrabold text-xl text-[#1a202c] mb-2">
                {dict.listing.noProperties}
              </h3>
              <p className="text-[#718096] mb-6 font-medium">
                {locale === "bn" ? "আপনার ফিল্টারের সাথে মিলে এমন কোনো জায়গা পাওয়া যায়নি।" : "We couldn't find any properties matching your criteria at the moment."}
              </p>
              <a href="/listings" className="neo-btn neo-btn-primary px-6 py-3 rounded-xl font-bold inline-block">
                {locale === "bn" ? "ফিল্টার মুছুন" : "Clear Filters"}
              </a>
            </div>
          )}
        </div>

        {/* Right Side: Sticky Interactive Map */}
        <div className="hidden lg:block lg:w-[45%] xl:w-[40%] relative">
          <div className="sticky top-24 h-[calc(100vh-140px)] w-full">
            <DynamicListingsMap listings={listings as ListingWithStats[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
