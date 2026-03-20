import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import ListingCard from "@/components/ListingCard";
import InteractiveHeroBg from "@/components/InteractiveHeroBg";
import { getDictionary, getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Restiqa — Find Your Perfect Stay",
  description:
    "Discover handpicked rentals — apartments, villas, and more — on Restiqa. Book instantly.",
};

/* ── Data ─────────────────────────────────────────── */
const FEATURED = [
  {
    id: "bd-1",
    title: "Cox's Bazar Sea View Apartment",
    location: "Kolatoli Beach, Cox's Bazar",
    price: 4500,
    rating: 4.9,
    reviews: 124,
    type: "Apartment",
    beds: 3,
    baths: 2,
    image: "https://images.unsplash.com/photo-1590603732440-236ca969c364?w=800",
    tag: "Superhost",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    id: "bd-2",
    title: "Sajek Valley Eco Resort",
    location: "Ruilui Para, Sajek",
    price: 3200,
    rating: 4.8,
    reviews: 89,
    type: "Resort",
    beds: 2,
    baths: 1,
    image: "https://images.unsplash.com/photo-1594738504031-74488182b133?w=800",
    tag: "Top Rated",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "bd-3",
    title: "Dhaka Luxury Suite (Gulshan)",
    location: "Gulshan 2, Dhaka",
    price: 8500,
    rating: 5.0,
    reviews: 242,
    type: "Suite",
    beds: 2,
    baths: 2,
    image: "https://images.unsplash.com/photo-1518173946687-a4c8a07d7e02?w=800",
    tag: null,
    gradient: "from-rose-400 to-pink-500",
  },
  {
    id: "bd-4",
    title: "Sylhet Tea Garden Cottage",
    location: "Srimangal, Sylhet",
    price: 2500,
    rating: 4.7,
    reviews: 67,
    type: "Cottage",
    beds: 1,
    baths: 1,
    image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800",
    tag: "Rare find",
    gradient: "from-green-400 to-lime-500",
  },
];

const DESTINATIONS = [
  { cityKey: "coxsBazar", country: "Bangladesh", listings: 340, emoji: "🏖️", color: "from-blue-400 to-cyan-600" },
  { cityKey: "sajek", country: "Bangladesh", listings: 120, emoji: "⛰️", color: "from-emerald-400 to-teal-600" },
  { cityKey: "dhaka", country: "Bangladesh", listings: 850, emoji: "🏙️", color: "from-rose-400 to-pink-600" },
  { cityKey: "sylhet", country: "Bangladesh", listings: 280, emoji: "🌿", color: "from-green-400 to-lime-600" },
  { cityKey: "chittagong", country: "Bangladesh", listings: 410, emoji: "🚢", color: "from-amber-400 to-orange-600" },
  { cityKey: "bandarban", country: "Bangladesh", listings: 150, emoji: "⛺", color: "from-yellow-400 to-amber-600" },
];

const WHY = [
  { icon: "✅", title: "Verified Listings", desc: "Every property is reviewed by our team before going live." },
  { icon: "⚡", title: "Instant Booking", desc: "Book instantly with confirmed availability in real time." },
  { icon: "🛡️", title: "Secure Payments", desc: "Industry-standard encryption protects every transaction." },
  { icon: "💬", title: "24/7 Support", desc: "Our team is always available before, during, and after your stay." },
];

/* ── Page ─────────────────────────────────────────── */
export default async function HomePage() {
  const dict = await getDictionary();
  const locale = await getLocale();

  return (
    <>
      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Interactive Travel Parallax Background */}
        <InteractiveHeroBg />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 w-full text-center pointer-events-none [&>*]:pointer-events-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 neo-badge mb-5">
            <span>✨</span>
            <span className="text-sm font-semibold text-[#4a5568]">
              {dict.hero.badge}
            </span>
          </div>

          <h1
            className="font-extrabold tracking-tight leading-tight mb-4"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              letterSpacing: "-0.03em",
              color: "#1a202c",
            }}
          >
            {dict.hero.titleBase}
            <span
              style={{
                background: "linear-gradient(135deg, #6c63ff, #ff6584)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {dict.hero.titleHighlight}
            </span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl mx-auto mb-10"
            style={{ color: "#718096" }}
          >
            {dict.hero.subtitle}
          </p>

          {/* ── Search card ── */}
          <div className="pointer-events-auto">
            <HeroSearch dict={dict} />
          </div>

          {/* Popular cities */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <span className="text-sm font-medium self-center" style={{ color: "#a0aec0" }}>
              {dict.search.popular}
            </span>
            {["coxsBazar", "sajek", "dhaka", "sylhet", "chittagong", "bandarban"].map((cityKey) => (
              <Link
                key={cityKey}
                href={`/listings?city=${cityKey}`}
                className="neo-card-sm px-3 py-1.5 text-sm font-medium no-underline transition-all hover:-translate-y-0.5"
                style={{ color: "#4a5568", textDecoration: "none" }}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(dict.search.cities as any)[cityKey]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED LISTINGS
      ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#6c63ff" }}>
              {dict.common.handpicked}
            </p>
            <h2
              className="font-extrabold leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#1a202c", letterSpacing: "-0.02em" }}
            >
              {dict.nav.listings}
            </h2>
          </div>
          <Link
            href="/listings"
            className="neo-btn px-5 py-2.5 text-sm rounded-xl no-underline"
            style={{ textDecoration: "none", color: "#6c63ff" }}
          >
            {dict.common.viewAll}
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((l) => {
            const fDict = (dict as any).featured?.[l.id] || { title: l.title, location: l.location, type: l.type };
            return (
              <ListingCard 
                key={l.id} 
                listing={{
                  ...l,
                  title: fDict.title,
                  location: fDict.location,
                  type: fDict.type,
                  images: [l.image], // Using Unsplash URL
                  price: l.price,
                  latitude: 23, // Mock coords
                  longitude: 90,
                  is_available: true,
                  host_id: "mock",
                  created_at: new Date().toISOString(),
                  avg_rating: l.rating,
                  review_count: l.reviews
                } as any} 
                dict={dict} 
              />
            );
          })}
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          POPULAR DESTINATIONS
      ═══════════════════════════════════════════ */}
      <section
        className="py-14"
        style={{ background: "linear-gradient(180deg,#e8edf2 0%,#dde4ec 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#6c63ff" }}>
              {dict.common.explore}
            </p>
            <h2
              className="font-extrabold"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#1a202c", letterSpacing: "-0.02em" }}
            >
              {dict.common.popularDest}
            </h2>
          </div>

          {/* Horizontal scroll row */}
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.cityKey}
                href={`/listings?city=${d.cityKey}`}
                className="dest-card neo-card rounded-[18px] overflow-hidden shrink-0 w-48 no-underline"
                style={{ textDecoration: "none" }}
              >
                {/* Mini map / image */}
                <div
                  className={`h-32 bg-gradient-to-br ${d.color} flex flex-col items-center justify-center`}
                >
                  <span className="text-5xl mb-1">{d.emoji}</span>
                </div>
                <div className="p-3.5">
                  <p className="font-bold text-sm" style={{ color: "#1a202c" }}>
                    {(dict.search.cities as any)[d.cityKey]}
                  </p>
                  <p className="text-xs mb-1" style={{ color: "#a0aec0" }}>
                    {d.country === "Bangladesh" ? dict.common.bangladesh : d.country}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "#6c63ff" }}>
                    {d.listings.toLocaleString()} {dict.common.listingsCount}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHY RESTIQA
      ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#6c63ff" }}>
            {dict.common.promise}
          </p>
          <h2
            className="font-extrabold"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#1a202c", letterSpacing: "-0.02em" }}
          >
            {dict.common.whyTitle}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.why.map(({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
            <div key={title} className="neo-card p-6 text-center rounded-[18px]">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{
                  background: "linear-gradient(135deg,#6c63ff,#ff6584)",
                  boxShadow: "4px 4px 12px rgba(108,99,255,0.3)",
                }}
              >
                {icon}
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#1a202c" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#718096" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div
          className="relative overflow-hidden rounded-[24px] text-center"
          style={{
            background: "linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)",
            padding: "clamp(2.5rem, 5vw, 4rem) 2rem",
            boxShadow: "10px 10px 30px rgba(108,99,255,0.3), -4px -4px 16px rgba(255,255,255,0.6)",
          }}
        >
          {/* Backdrop blobs */}
          <div
            className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "#fff" }}
          />

          <p className="text-sm font-bold uppercase tracking-widest mb-3 opacity-80 text-white">
            {dict.common.readyToExplore}
          </p>
          <h2
            className="font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", letterSpacing: "-0.03em" }}
          >
            {dict.common.ctaTitle}
          </h2>
          <p
            className="text-base mb-8 max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {dict.common.ctaSubtitle}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/listings"
              className="font-bold py-3 px-8 rounded-xl no-underline transition-all hover:-translate-y-1"
              id="cta-browse"
              style={{
                background: "#fff",
                color: "#6c63ff",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                fontSize: "0.95rem",
              }}
            >
              {dict.common.ctaBrowse}
            </Link>
            <Link
              href="/login"
              className="font-bold py-3 px-8 rounded-xl no-underline transition-all hover:-translate-y-1"
              id="cta-signup"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.5)",
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              {dict.common.ctaSignup}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
