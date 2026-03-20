"use client";

import { useState, useEffect } from "react";
import { createBooking } from "@/app/actions/booking";
import { useFormStatus } from "react-dom";

import { type dictionaries } from "@/lib/i18n/dictionaries";

interface BookingCardProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
  dict: typeof dictionaries["en"];
}

function SubmitButton({ dict }: { dict: typeof dictionaries["en"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`neo-btn neo-btn-primary w-full py-4 rounded-[16px] font-extrabold text-lg transition-transform ${
        pending ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1 active:scale-95"
      }`}
      style={{ boxShadow: "0 10px 25px -5px rgba(108, 99, 255, 0.4)" }}
    >
      {pending ? dict.booking.reserving : dict.booking.reserve}
    </button>
  );
}

export default function BookingCard({ listingId, pricePerNight, maxGuests, dict }: BookingCardProps) {
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate nights whenever dates change
  useEffect(() => {
    if (checkin && checkout) {
      const start = new Date(checkin);
      const end = new Date(checkout);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        setNights(diffDays);
        setErrorMsg("");
      } else {
        setNights(0);
        setErrorMsg("Check-out must be after check-in.");
      }
    } else {
      setNights(0);
      setErrorMsg("");
    }
  }, [checkin, checkout]);

  const totalPrice = nights > 0 ? nights * pricePerNight : 0;

  // Form action handler wrapper to catch UI-level errors
  async function handleAction(formData: FormData) {
    if (nights < 1) {
      setErrorMsg("Please select valid dates (minimum 1 night).");
      return;
    }
    
    setErrorMsg("");
    const result = await createBooking(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
    }
  }

  // Generate today's date for standard 'min' attributes
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div
      className="neo-card p-6 rounded-[32px] sticky top-24"
      style={{ border: "1px solid #ffffff" }}
    >
      <div className="flex items-end gap-1 mb-6">
        <span className="text-3xl font-extrabold text-[#1a202c]">{dict.common.currency}{Math.round(pricePerNight)}</span>
        <span className="text-sm font-semibold mb-1 text-[#a0aec0]"> {dict.common.pricePerNight}</span>
      </div>

      <form action={handleAction}>
        <input type="hidden" name="listingId" value={listingId} />

        <div className="neo-inset rounded-[20px] p-2 mb-6">
          <div className="flex border-b border-[#d1d9e0] flex-col sm:flex-row">
            <div className="flex-1 p-3 sm:border-r border-[#d1d9e0]">
              <label 
                htmlFor="checkin" 
                className="block text-[10px] font-extrabold uppercase tracking-wider text-[#a0aec0] mb-1"
              >
                {dict.booking.checkIn}
              </label>
              <input
                type="date"
                id="checkin"
                name="checkin"
                required
                min={todayStr}
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-[#2d3748] focus:outline-none appearance-none"
                style={{ colorScheme: "light" }}
              />
            </div>
            <div className="flex-1 p-3 border-t sm:border-t-0 border-[#d1d9e0]">
              <label 
                htmlFor="checkout" 
                className="block text-[10px] font-extrabold uppercase tracking-wider text-[#a0aec0] mb-1"
              >
                {dict.booking.checkOut}
              </label>
              <input
                type="date"
                id="checkout"
                name="checkout"
                required
                min={checkin || todayStr}
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-[#2d3748] focus:outline-none appearance-none"
                style={{ colorScheme: "light" }}
              />
            </div>
          </div>
          
          <div className="p-3">
            <label 
              htmlFor="guests" 
              className="block text-[10px] font-extrabold uppercase tracking-wider text-[#a0aec0] mb-1"
            >
              {dict.booking.guests}
            </label>
            <select
              id="guests"
              name="guests"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="w-full bg-transparent text-sm font-bold text-[#2d3748] focus:outline-none appearance-none pr-4"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%232d3748%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.2rem top 50%",
                backgroundSize: "0.65rem auto",
              }}
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? dict.booking.guests : dict.booking.guest}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 text-sm font-bold text-[#e53e3e] px-2">
            {errorMsg}
          </div>
        )}

        <SubmitButton dict={dict} />
        
        <p className="text-center text-xs text-[#a0aec0] mt-4 font-medium">
          {dict.booking.notChargedYet}
        </p>

        {/* Live Calculation Display */}
        {nights > 0 && (
          <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
            <div className="flex justify-between items-center py-2" style={{ color: "#4a5568" }}>
              <span>{dict.common.currency}{Math.round(pricePerNight)} × {nights} {nights > 1 ? dict.booking.nights : dict.booking.night}</span>
              <span>{dict.common.currency}{totalPrice}</span>
            </div>
            <div className="flex justify-between items-center py-2" style={{ color: "#4a5568" }}>
              <span>{dict.booking.serviceFee}</span>
              <span>{dict.common.currency}0</span>
            </div>
            <div className="flex justify-between items-center font-extrabold text-lg text-[#1a202c] pt-4 border-t border-[#e2e8f0]">
              <span>{dict.booking.total}</span>
              <span>{dict.common.currency}{totalPrice}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
