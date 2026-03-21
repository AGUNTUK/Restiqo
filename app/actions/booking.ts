"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function checkAvailability(listingId: string, checkin: string, checkout: string) {
  // Always return true as per user request to make all dates available
  return { available: true };
}

export async function createBooking(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to book a stay." };
  }

  // 2. Extract and validate form data
  const listingId = formData.get("listingId") as string;
  const checkinStr = formData.get("checkin") as string;
  const checkoutStr = formData.get("checkout") as string;
  const guests = parseInt(formData.get("guests") as string, 10);

  if (!listingId || !checkinStr || !checkoutStr || !guests) {
    return { error: "Missing booking details." };
  }

  const checkin = new Date(checkinStr);
  const checkout = new Date(checkoutStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkin < today) {
    return { error: "Check-in date cannot be in the past." };
  }
  
  if (checkout <= checkin) {
    return { error: "Check-out date must be after check-in date." };
  }

  // Calculate nights
  const diffTime = Math.abs(checkout.getTime() - checkin.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    return { error: "Minimum stay is 1 night." };
  }

  // 2.5 Availability check (Bypassed as per user request)
  // All dates are open for demo purposes

  // 3. Fetch canonical price from the database to prevent pricing tampering
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("price, max_guests")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found." };
  }

  if (guests > listing.max_guests) {
    return { error: `Maximum allowed guests is ${listing.max_guests}.` };
  }

  const totalPrice = listing.price * nights;
  const commission = totalPrice * 0.10;
  const hostEarnings = totalPrice - commission;

  // 4. Insert the booking into the database and get the ID back
  const { data: newBooking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      listing_id: listingId,
      checkin: checkinStr,
      checkout: checkoutStr,
      guests_count: guests,
      total_price: totalPrice,
      total_amount: totalPrice,
      commission_amount: commission,
      host_earnings: hostEarnings,
      status: "pending",
      payment_status: "pending",
      payout_status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !newBooking) {
    console.error("Booking insert error:", insertError?.message);
    return { error: "Failed to create booking. Please try again." };
  }

  // 5. Redirect to the payment gateway simulation
  redirect(`/payment/${newBooking.id}`);
}

export async function updateBookingStatus(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as string;

  if (!bookingId || !status || !["confirmed", "rejected"].includes(status)) {
    throw new Error("Invalid input");
  }

  // Verify the user owns the listing associated with this booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("listings(host_id)")
    .eq("id", bookingId)
    .single();

  if (!booking || (booking.listings as any).host_id !== user.id) {
    throw new Error("Unauthorized to update this booking");
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) {
    console.error("Failed to update booking status:", error);
    throw new Error("Failed to update booking status");
  }

  revalidatePath("/dashboard");
}

export async function cancelBooking(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) throw new Error("Invalid booking ID");

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found");

  // Allow cancellation by the traveler
  if (booking.user_id !== user.id) {
     throw new Error("Unauthorized");
  }

  const checkinDate = new Date(booking.checkin);
  const now = new Date();
  const isBeforeCheckin = now < checkinDate;

  if (isBeforeCheckin) {
    // Full refund logic
    await supabase.from("bookings").update({ status: "cancelled", payment_status: "refunded" }).eq("id", bookingId);
    
    if (booking.payment_status === "paid" || booking.payment_status === "completed") {
      await supabase.from("transactions").insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: booking.total_amount || booking.total_price,
        type: "refund",
        status: "completed"
      });
    }
  } else {
    // No refund, the host keeps earnings
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  }

  revalidatePath("/dashboard");
}
