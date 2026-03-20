"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { dictionaries } from "@/lib/i18n/dictionaries";
import LocationAutocomplete from "./LocationAutocomplete";
import GuestSelector from "./GuestSelector";
import { GUEST_OPTIONS } from "@/lib/constants";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import Image from "next/image";

const POPULAR_LOCATIONS = [
  { 
    name: "Cox’s Bazar", 
    image: "https://images.unsplash.com/photo-1590001158193-790130ae8f2a?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Dhaka", 
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sajek", 
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Sylhet", 
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=300&auto=format&fit=crop" 
  },
  { 
    name: "Bandarban", 
    image: "https://images.unsplash.com/photo-1623944889288-cd147dbb517c?q=80&w=300&auto=format&fit=crop" 
  },
];

type Guests = { adults: number; children: number; infants: number };

export default function HeroSearch({ dict }: { dict: typeof dictionaries["en"] }) {
  const router = useRouter();
  const { searches, addSearch, clearSearches } = useRecentSearches();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<Guests>({ adults: 1, children: 0, infants: 0 });

  // Advanced Filters
  const [ac, setAc] = useState(false);
  const [nonAc, setNonAc] = useState(false);
  const [nearSea, setNearSea] = useState(false);
  const [hillView, setHillView] = useState(false);
  const [cityCenter, setCityCenter] = useState(false);
  const [coupleFriendly, setCoupleFriendly] = useState(false);
  const [familyFriendly, setFamilyFriendly] = useState(false);

  const totalGuests = guests.adults + guests.children;

  function changeGuest(key: keyof Guests, delta: number) {
    const min = GUEST_OPTIONS.find(o => o.key === key)?.min ?? 0;
    setGuests((g) => ({
      ...g,
      [key]: Math.max(min, g[key] + delta),
    }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (totalGuests > 0) params.set("guests", String(totalGuests));
    
    // Tag Filters Array
    const filters = [];
    if (ac) filters.push("AC");
    if (nonAc) filters.push("Non-AC");
    if (nearSea) filters.push("Near Sea");
    if (hillView) filters.push("Hill View");
    if (cityCenter) filters.push("City Center");
    if (coupleFriendly) filters.push("Couple-friendly");
    if (familyFriendly) filters.push("Family-friendly");
    
    if (filters.length > 0) {
      params.set("amenities", filters.join(","));
    }

    // Save to Recent Searches
    addSearch({
      location,
      checkin: checkIn,
      checkout: checkOut,
      guests
    });

    router.push(`/listings?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="neo-card w-full max-w-4xl mx-auto rounded-[20px] p-3"
    >
      {/* Desktop: single row | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Location */}
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.location}
          </label>
          <div className="relative">
            <LocationAutocomplete
              placeholder={dict.search.where}
              defaultValue={location}
              onSelect={(loc) => setLocation(loc.name)}
            />
          </div>
        </div>

        {/* Divider (desktop only) */}
        <div className="hidden lg:block w-px self-stretch" style={{ background: "#d1d9e0" }} />

        {/* Check-in */}
        <div className="flex-1 min-w-0">
          <label htmlFor="hero-checkin" className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.checkIn}
          </label>
          <div className="neo-inset flex items-center gap-2 px-3 rounded-xl">
            <span className="text-base">📅</span>
            <input
              id="hero-checkin"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="bg-transparent border-none outline-none py-4 text-sm flex-1"
              style={{ color: checkIn ? "#2d3748" : "#a0aec0", fontFamily: "inherit", minWidth: 0 }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px self-stretch" style={{ background: "#d1d9e0" }} />

        {/* Check-out */}
        <div className="flex-1 min-w-0">
          <label htmlFor="hero-checkout" className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.checkOut}
          </label>
          <div className="neo-inset flex items-center gap-2 px-3 rounded-xl">
            <span className="text-base">📅</span>
            <input
              id="hero-checkout"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent border-none outline-none py-4 text-sm flex-1"
              style={{ color: checkOut ? "#2d3748" : "#a0aec0", fontFamily: "inherit", minWidth: 0 }}
              min={checkIn || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Guests via Portal */}
        <GuestSelector 
          guests={guests} 
          onGuestsChange={changeGuest} 
          dict={dict} 
        />

        {/* Search button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="neo-btn neo-btn-primary rounded-xl font-extrabold text-sm px-8 py-4 w-full lg:w-auto whitespace-nowrap active:scale-95 transition-all"
            id="hero-search-btn"
          >
            🔍 {dict.search.searchBtn}
          </button>
        </div>
      </div>

      {/* Popular Locations Discovery */}
      <div className="mt-4 pt-3 border-t border-[#d1d9e0]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0] mb-3 block px-1">
          Popular Destinations
        </span>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => setLocation(loc.name)}
              className="flex-shrink-0 group relative overflow-hidden neo-card-sm w-32 h-20 rounded-xl transition-all active:scale-95 border border-white/40"
            >
              <Image 
                src={loc.image} 
                alt={loc.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-wider drop-shadow-md">
                  {loc.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {searches.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#d1d9e0]">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">
              Recent Searches
            </span>
            <button 
              type="button" 
              onClick={clearSearches}
              className="text-[10px] font-bold uppercase tracking-widest text-[#6c63ff] hover:opacity-70 transition-opacity"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searches.map((s, i) => (
              <button
                key={`${s.location}-${s.timestamp}`}
                type="button"
                onClick={() => {
                  setLocation(s.location);
                  setCheckIn(s.checkin);
                  setCheckOut(s.checkout);
                  setGuests(s.guests);
                }}
                className="neo-card-sm flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-[#4a5568] hover:bg-white/40 transition-all border border-white/40"
              >
                <span className="opacity-60 text-sm">🕒</span>
                <span>{s.location || "Anywhere"}</span>
                {s.checkin && (
                  <span className="text-[10px] text-[#a0aec0] font-medium border-l border-[#d1d9e0] pl-2 ml-1">
                    {new Date(s.checkin).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <span className="text-[10px] text-[#a0aec0] font-medium border-l border-[#d1d9e0] pl-2 ml-1">
                  {s.guests.adults + s.guests.children} guest{(s.guests.adults + s.guests.children) !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-3 mt-3 border-t border-[#d1d9e0]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">{dict.filters.title}:</span>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {/* AC / Non-AC */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.ac}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={nonAc} onChange={(e) => setNonAc(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.nonAc}
          </label>

          {/* Location Types */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={nearSea} onChange={(e) => setNearSea(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.nearSea}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={hillView} onChange={(e) => setHillView(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.hillView}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={cityCenter} onChange={(e) => setCityCenter(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.cityCenter}
          </label>

          {/* Property Types / Vibes */}
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={familyFriendly} onChange={(e) => setFamilyFriendly(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.familyFriendly}
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer font-medium" style={{ color: "#4a5568" }}>
            <input type="checkbox" checked={coupleFriendly} onChange={(e) => setCoupleFriendly(e.target.checked)} className="rounded border-[#d1d9e0]" />
            {dict.filters.coupleFriendly}
          </label>
        </div>
      </div>

    </form>
  );
}
