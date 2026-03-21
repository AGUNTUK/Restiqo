"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAvailability, createBooking } from "@/app/actions/booking";

interface BookingWidgetProps {
  listingId: string;
  price: number;
  maxGuests: number;
  dict: any;
}

export default function BookingWidget({ listingId, price, maxGuests, dict }: BookingWidgetProps) {
  const router = useRouter();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(1);
  const [availability, setAvailability] = useState<{ available: boolean; checked: boolean }>({ available: true, checked: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nights = (checkin && checkout) 
    ? Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  
  const subtotal = price * (nights > 0 ? nights : 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  // No longer checking availability as all dates are available
  useEffect(() => {
    if (checkin && checkout && new Date(checkout) > new Date(checkin)) {
      setAvailability({ available: true, checked: true });
    } else {
      setAvailability({ available: false, checked: false });
    }
  }, [checkin, checkout]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability.available) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("listingId", listingId);
    formData.append("checkin", checkin);
    formData.append("checkout", checkout);
    formData.append("guests", guests.toString());

    const result = await createBooking(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // createBooking handles redirect on success
  };

  return (
    <div className="sticky top-24">
      <div className="neo-card p-6 md:p-8 rounded-[28px]">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-2xl font-extrabold text-[#1a202c]">{dict.common.currency}{Math.round(price)}</span>
            <span className="text-[#718096] font-medium"> / {dict.common.pricePerNight}</span>
          </div>
        </div>

        <form onSubmit={handleBooking} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 border border-[#cbd5e0] rounded-[16px] overflow-hidden">
            <div className="p-3 border-r border-[#cbd5e0] neo-shadow-inset">
              <label className="text-[10px] font-extrabold text-[#1a202c] uppercase tracking-wider mb-1 block">Check-in</label>
              <input 
                type="date" 
                className="bg-transparent border-none p-0 text-sm font-medium text-[#2d3748] focus:ring-0 w-full cursor-pointer"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="p-3 neo-shadow-inset">
              <label className="text-[10px] font-extrabold text-[#1a202c] uppercase tracking-wider mb-1 block">Check-out</label>
              <input 
                type="date" 
                className="bg-transparent border-none p-0 text-sm font-medium text-[#2d3748] focus:ring-0 w-full cursor-pointer"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                min={checkin || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          <div className="p-3 border border-[#cbd5e0] rounded-[16px] neo-shadow-inset">
            <label className="text-[10px] font-extrabold text-[#1a202c] uppercase tracking-wider mb-1 block">Guests</label>
            <select 
              className="bg-transparent border-none p-0 text-sm font-medium text-[#2d3748] focus:ring-0 w-full cursor-pointer"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
            >
              {[...Array(maxGuests)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? dict.booking.guest : dict.booking.guests}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-xs font-semibold px-1">{error}</p>}

          <button 
            type="submit"
            disabled={loading || (availability.checked && !availability.available) || !checkin || !checkout}
            className={`neo-btn w-full py-4 rounded-2xl text-lg font-extrabold mb-4 shadow-xl transition-all ${
              availability.checked && !availability.available 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "neo-btn-primary hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {loading ? "Checking..." : availability.checked ? (availability.available ? "Reserve now" : "Unavailable") : "Check availability"}
          </button>
        </form>

        <p className="text-center text-sm text-[#718096] font-medium mb-6">
          {dict.booking.notChargedYet}
        </p>

        {nights > 0 && (
          <>
            <div className="space-y-3 pb-6 border-b border-[#e2e8f0]">
              <div className="flex justify-between text-[#4a5568] font-medium">
                <span className="underline decoration-1 underline-offset-4 cursor-help">{dict.common.currency}{Math.round(price)} x {nights} nights</span>
                <span>{dict.common.currency}{Math.round(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#4a5568] font-medium">
                <span className="underline decoration-1 underline-offset-4 cursor-help">Restiqa service fee</span>
                <span>{dict.common.currency}{Math.round(serviceFee)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-6 font-extrabold text-lg text-[#1a202c]">
              <span>Total before taxes</span>
              <span>{dict.common.currency}{Math.round(total)}</span>
            </div>
          </>
        )}
      </div>

      <div className="text-center mt-6 p-4 neo-inset rounded-2xl">
        <p className="text-sm font-bold text-[#1a202c] mb-1">Report this listing</p>
        <p className="text-xs text-[#718096]">If you notice anything suspicious or incorrect.</p>
      </div>
    </div>
  );
}
