import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body - only expect bookingId
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 3. Security Check: Ensure user owns the booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status, total_amount, total_price, user_id")
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
    }

    // Prevent duplicate payment requests
    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in pending state" }, { status: 400 });
    }

    console.info(`[Payment Event] Initiating Checkout Session for booking_id: ${booking.id} (user: ${user.id})`);

    const expectedAmount = booking.total_amount || booking.total_price;

    // 4. Call external PipraPay Payment API
    const pipraBaseUrl = process.env.PIPRAPAY_BASE_URL;
    const pipraApiKey = process.env.PIPRAPAY_API_KEY;

    if (!pipraBaseUrl || !pipraApiKey) {
      console.error("Payment API configuration missing");
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 });
    }

    // Construct success/cancel URLs based on the origin or NEXT_PUBLIC_APP_URL
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${appBaseUrl}/payment/success?bookingId=${bookingId}`;
    const cancelUrl = `${appBaseUrl}/payment/failed?bookingId=${bookingId}`;

    const paymentResponse = await fetch(`${pipraBaseUrl}/checkout`, {
      method: "POST",
      headers: {
        "x-api-key": pipraApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: expectedAmount, // 100% server calculated
        currency: "BDT",
        order_id: bookingId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("External Payment API Error:", errorText);
      return NextResponse.json({ error: "Failed to initiate payment" }, { status: 502 });
    }

    const paymentData = await paymentResponse.json();

    if (!paymentData.payment_url) {
      return NextResponse.json({ error: "Invalid response from payment service" }, { status: 502 });
    }

    console.info(`[Payment Event] Checkout Session generated successfully for booking_id: ${booking.id}`);

    // 5. Return checkout URL to frontend
    return NextResponse.json({ payment_url: paymentData.payment_url });

  } catch (error) {
    console.error("Payment API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
