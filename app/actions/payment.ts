"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmPayment(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;

  if (!bookingId) {
    return { error: "Missing booking ID." };
  }

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to confirm a payment." };
  }

  // 2. Security Check: ensure this user owns the pending booking
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status, total_amount, total_price")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !booking) {
    return { error: "Booking not found or access denied." };
  }

  if (booking.status !== "pending") {
    // If it's already confirmed or cancelled, just bounce them to dashboard
    redirect("/dashboard");
  }

  // 3. Update status to 'confirmed' and Set 'paid'
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "confirmed", payment_status: "paid" })
    .eq("id", bookingId);

  // 4. Insert Transaction Logic
  await supabase.from("transactions").insert({
    booking_id: bookingId,
    user_id: user.id,
    amount: booking.total_amount || booking.total_price,
    type: "payment",
    status: "completed"
  });

  if (updateError) {
    console.error("Payment confirmation error:", updateError.message);
    return { error: "Failed to confirm payment. Please try again." };
  }

  // 4. Redirect to Dashboard with fresh data
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
