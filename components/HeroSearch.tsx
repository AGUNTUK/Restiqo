"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { dictionaries } from "@/lib/i18n/dictionaries";
import LocationAutocomplete from "./LocationAutocomplete";

const GUEST_OPTIONS = [
  { key: "adults", label: "Adults", sub: "Ages 13+", min: 0 },
  { key: "children", label: "Children", sub: "Ages 2–12", min: 0 },
  { key: "infants", label: "Infants", sub: "Under 2", min: 0 },
];

type Guests = { adults: number; children: number; infants: number };

export default function HeroSearch({ dict }: { dict: typeof dictionaries["en"] }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<Guests>({ adults: 0, children: 0, infants: 0 });
  const [guestOpen, setGuestOpen] = useState(false);

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
    setGuests((g) => ({
      ...g,
      [key]: Math.max(GUEST_OPTIONS.find((o) => o.key === key)!.min, g[key] + delta),
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

        {/* Divider */}
        <div className="hidden lg:block w-px self-stretch" style={{ background: "#d1d9e0" }} />

        {/* Guests */}
        <div className="flex-1 min-w-0 relative">
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
            {dict.search.guests}
          </label>
          <button
            type="button"
            onClick={() => setGuestOpen(!guestOpen)}
            className="neo-inset w-full flex items-center gap-2 px-3 py-4 rounded-xl text-left"
            id="hero-guests-btn"
          >
            <span className="text-base">👥</span>
            <span className="text-sm flex-1" style={{ color: totalGuests > 0 ? "#2d3748" : "#a0aec0" }}>
              {totalGuests > 0 ? `${totalGuests} ${dict.search.guests.toLowerCase()}` : dict.search.addGuests}
            </span>
            <span className="text-xs transition-transform" style={{ transform: guestOpen ? "rotate(180deg)" : "none", color: "#a0aec0" }}>▾</span>
          </button>

          {/* Guest dropdown */}
          {guestOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-72 neo-card rounded-2xl p-4 z-50"
              style={{ background: "#e8edf2" }}
            >
              {GUEST_OPTIONS.map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#d1d9e0" }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#2d3748" }}>{label}</p>
                    <p className="text-xs" style={{ color: "#a0aec0" }}>{sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => changeGuest(key as keyof Guests, -1)}
                      className="neo-btn w-8 h-8 rounded-lg text-lg font-bold"
                      style={{ color: "#6c63ff" }}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-bold text-sm" style={{ color: "#2d3748" }}>
                      {guests[key as keyof Guests]}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeGuest(key as keyof Guests, 1)}
                      className="neo-btn w-8 h-8 rounded-lg text-lg font-bold"
                      style={{ color: "#6c63ff" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
