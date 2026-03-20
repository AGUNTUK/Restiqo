"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Portal from "./ui/Portal";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { GUEST_OPTIONS } from "@/lib/constants";

interface Guests {
  adults: number;
  children: number;
  infants: number;
}
interface GuestSelectorProps {
  guests: Guests;
  onGuestsChange: (key: keyof Guests, delta: number) => void;
  dict: typeof dictionaries["en"];
}


const GuestSelector: React.FC<GuestSelectorProps> = ({ guests, onGuestsChange, dict }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalGuests = guests.adults + guests.children;

  // Calculate position
  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="flex-1 min-w-0 relative">
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1 pl-1" style={{ color: "#a0aec0" }}>
        {dict.search.guests}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="neo-inset w-full flex items-center gap-2 px-3 py-4 rounded-xl text-left transition-all active:scale-[0.98]"
      >
        <span className="text-base">👥</span>
        <span className="text-sm flex-1 font-bold" style={{ color: totalGuests > 0 ? "#2d3748" : "#a0aec0" }}>
          {totalGuests > 0 ? `${totalGuests} ${dict.search.guests.toLowerCase()}` : dict.search.addGuests}
        </span>
        <span className={`text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ color: "#a0aec0" }}>▾</span>
      </button>

      {isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[9999] mt-2 animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: coords.top - window.scrollY,
              left: coords.left,
              width: Math.max(coords.width, 280),
            }}
          >
            <div className="neo-card rounded-2xl p-5 bg-[#e8edf2] border border-white/60 shadow-2xl">
              {GUEST_OPTIONS.map(({ key, label, sub, min }) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between py-4 border-b border-[#d1d9e0] last:border-0"
                >
                  <div className="pr-4">
                    <p className="font-extrabold text-sm text-[#2d3748]">{label}</p>
                    <p className="text-[10px] text-[#a0aec0] font-medium leading-none mt-1">{sub}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={guests[key as keyof Guests] <= min}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGuestsChange(key as keyof Guests, -1);
                      }}
                      className="neo-btn w-9 h-9 flex items-center justify-center rounded-xl text-lg font-black bg-white/50 text-[#6c63ff] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-black text-base text-[#2d3748] tabular-nums">
                      {guests[key as keyof Guests]}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGuestsChange(key as keyof Guests, 1);
                      }}
                      className="neo-btn w-9 h-9 flex items-center justify-center rounded-xl text-lg font-black bg-white/50 text-[#6c63ff] transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-[#d1d9e0] text-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full neo-btn py-2.5 rounded-xl text-xs font-extrabold text-[#6c63ff] uppercase tracking-widest hover:bg-white/40 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default GuestSelector;
