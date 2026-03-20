import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type ListingWithStats } from "@/lib/types/database";
import ListingCard from "@/components/ListingCard";
import { getDictionary } from "@/lib/i18n";

// Define supported locations and their SEO metadata
const LOCATION_MAP: Record<string, { city: string; title: string; description: string; h1: string; intro: string }> = {
  "dhaka": {
    city: "Dhaka",
    title: "Best Hotels and Apartments in Dhaka | Restiqa",
    description: "Looking for a hotel in Dhaka? Book premium serviced apartments and luxury stays in Gulshan, Banani, and Dhanmondi at the best prices.",
    h1: "Premium Stays & Hotels in Dhaka",
    intro: "Experience the vibrant heart of Bangladesh. From high-end serviced apartments in Gulshan to cozy creative studios in Dhanmondi, find your perfect stay in Dhaka with Restiqa's verified listings."
  },
  "coxs-bazar": {
    city: "Cox's Bazar",
    title: "Top Beach Resorts and Hotels in Cox's Bazar | Restiqa",
    description: "Experience the world's longest sea beach. Book the best beach-view resorts and hotels in Cox's Bazar for your next holiday.",
    h1: "Beachfront Resorts in Cox's Bazar",
    intro: "Wake up to the sound of waves. Explore our curated selection of top-rated beach resorts and luxury hotels along the world's longest natural sea beach in Cox's Bazar."
  },
  "sylhet": {
    city: "Sylhet",
    title: "Best Resorts and Nature Stays in Sylhet | Restiqa",
    description: "Explore the tea gardens of Sylhet. Book premium resorts in Sreemangal and Sylhet city for a peaceful and green retreat.",
    h1: "Nature Resorts & Cottages in Sylhet",
    intro: "Escape to the land of two leaves and a bud. Whether you are visiting Sreemangal's tea gardens or the swamp forests of Ratargul, enjoy a peaceful stay in Sylhet's best eco-resorts."
  },
  "sajek": {
    city: "Sajek",
    title: "Top Resorts in Sajek Valley - Above the Clouds | Restiqa",
    description: "Wake up above the clouds. Book the best resorts in Sajek Valley with stunning views, modern amenities, and local experiences.",
    h1: "Luxury Resorts in Sajek Valley",
    intro: "Discover the 'Queen of Hills'. Stay in premium wooden cottages and modern resorts in Sajek Valley, where you can watch the sunrise over the clouds from your private balcony."
  }
};

interface Props {
  params: Promise<{ location: string }>;
}

export async function generateStaticParams() {
  return Object.keys(LOCATION_MAP).map((location) => ({
    location: location,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const config = LOCATION_MAP[location.toLowerCase()];

  if (!config) return { title: "Explore Bangladesh | Restiqa" };

  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
    },
    alternates: {
      canonical: `/${location.toLowerCase()}`,
    }
  };
}

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  const config = LOCATION_MAP[location.toLowerCase()];

  if (!config) {
    notFound();
  }

  const dict = await getDictionary();
  let listings: ListingWithStats[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listings_with_stats")
      .select("*")
      .eq("city", config.city)
      .eq("status", "approved")
      .order("avg_rating", { ascending: false })
      .limit(12);

    if (!error && data) {
      listings = data as ListingWithStats[];
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      {/* Hero Section */}
      <div className="mb-12 max-w-3xl">
        <nav className="flex items-center gap-2 text-sm font-bold text-[#6c63ff] mb-6 uppercase tracking-widest">
          <a href="/listings" className="hover:underline">Explore</a>
          <span>/</span>
          <span className="text-[#a0aec0]">{config.city}</span>
        </nav>
        
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight" style={{ color: "#1a202c", letterSpacing: "-0.04em" }}>
          {config.h1}
        </h1>
        
        <p className="text-lg md:text-xl text-[#718096] font-medium leading-relaxed">
          {config.intro}
        </p>
      </div>

      {/* Listings Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e2e8f0]">
          <h2 className="text-2xl font-bold text-[#1a202c]">Top Properties in {config.city}</h2>
          <a href={`/listings?city=${config.city}`} className="text-[#6c63ff] font-bold text-sm hover:underline">
            View all {config.city} stays →
          </a>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} dict={dict} />
            ))}
          </div>
        ) : (
          <div className="neo-card p-12 rounded-[32px] text-center max-w-2xl mx-auto">
            <p className="text-lg text-[#718096] mb-6">We're currently expanding our collection in {config.city}.</p>
            <a href="/listings" className="neo-btn neo-btn-primary px-8 py-3 rounded-xl font-bold inline-block">
              Browse All Listings
            </a>
          </div>
        )}
      </div>

      {/* SEO Content Section (Optional extra value) */}
      <div className="bg-[#f7fafc] rounded-[40px] p-8 md:p-12 border border-white shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-[#2d3748]">Plan Your Trip to {config.city}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#4a5568] leading-relaxed">
          <div>
            <p className="mb-4">
              {config.city} is one of the most visited destinations in Bangladesh, offering a unique blend of 
              {location === "dhaka" ? " modern urban life and historical heritage." : 
               location === "coxs-bazar" ? " natural beauty and coastal relaxation." :
               location === "sylhet" ? " lush greenery and cultural richness." : " hilly landscapes and cloud-level serenity."}
            </p>
            <p>
              Restiqa offers the safest and most reliable platform to book verified {config.city} accommodation. 
              Our hosts are local experts who ensure your stay is comfortable and memorable.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#1a202c]">Why book with Restiqa?</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li className="flex items-center gap-2">✅ Verified properties and hosts</li>
              <li className="flex items-center gap-2">✅ Secure mobile payments (PipraPay)</li>
              <li className="flex items-center gap-2">✅ Real guest reviews and ratings</li>
              <li className="flex items-center gap-2">✅ 24/7 customer support for bookings</li>
            </ul>
          </div>
          </div>
      </div>

      {/* Related Blog/Guides */}
      <section className="mt-24 text-center">
        <div className="neo-card p-12 rounded-[40px] bg-white max-w-3xl mx-auto border border-white">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a202c] mb-4">
            Travel Guide: {config.city}
          </h2>
          <p className="text-[#718096] font-medium mb-8">
            Check out our latest tips, top attractions, and hidden gems in {config.city} to make your trip unforgettable.
          </p>
          <a
            href="/blog" 
            className="neo-btn neo-btn-primary px-10 py-4 rounded-2xl font-extrabold inline-block shadow-lg no-underline"
          >
            Read {config.city} Guides →
          </a>
        </div>
      </section>
    </div>
  );
}
