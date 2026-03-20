import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Parse request body safely
    let body;
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      // Try JSON as fallback
      body = await request.json().catch(() => ({}));
    }

    const transaction_id = body.transaction_id || body.tran_id;

    if (!transaction_id) {
      console.warn("[Payment Event] Webhook received without transaction_id");
      return NextResponse.json({ error: "Missing transaction_id" }, { status: 400 });
    }

    console.info(`[Payment Event] Webhook received for transaction_id: ${transaction_id}`);

    // Call external PipraPay API to securely verify the authenticity of the webhook
    const pipraBaseUrl = process.env.PIPRAPAY_BASE_URL;
    const pipraApiKey = process.env.PIPRAPAY_API_KEY;

    if (!pipraBaseUrl || !pipraApiKey) {
      console.error("Payment API configuration missing for webhook");
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 });
    }

    const verifyResponse = await fetch(`${pipraBaseUrl}/pay/api/verify`, {
      method: "POST",
      headers: {
        "x-api-key": pipraApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id }),
    });

    if (!verifyResponse.ok) {
      console.error("Webhook Verification API Error:", await verifyResponse.text());
      // Return 200 so the gateway doesn't retry a genuinely failed/malicious request constantly
      return NextResponse.json({ message: "Verification failed" }, { status: 200 });
    }

    const verificationData = await verifyResponse.json();
    
    const { status, order_id, amount } = verificationData;
    
    if (!order_id || amount === undefined) {
      console.error("Webhook returned invalid verified response");
      return NextResponse.json({ message: "Invalid response from verifier" }, { status: 200 });
    }

    // Database lookup
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status, payment_status, total_amount, total_price, user_id")
      .eq("id", order_id)
      .single();

    if (fetchError || !booking) {
      console.error(`Webhook: Booking ${order_id} not found`);
      return NextResponse.json({ message: "Booking not found" }, { status: 200 });
    }

    // --- IDEMPOTENCY CHECK ---
    // If the booking is already paid, we don't process it again.
    // We confirm receipt with 200 OK.
    if (booking.payment_status === "paid" && booking.status === "confirmed") {
      console.log(`Webhook: Booking ${order_id} already successfully processed.`);
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    const expectedAmount = booking.total_amount || booking.total_price;

    // Validate that the verified amount strictly equals the backend expected amount
    if (Math.abs(Number(amount) - Number(expectedAmount)) > 0.01) {
      console.error(`Webhook Amount mismatch: Expected ${expectedAmount}, Verified ${amount}`);
      return NextResponse.json({ message: "Payment amount mismatch" }, { status: 200 });
    }

    // Determine success or failure
    if (status === "success" || status === "COMPLETED" || status === "SUCCESS") {
      
      const commission = Number(expectedAmount) * 0.10;
      const hostEarnings = Number(expectedAmount) - commission;

      // Update the booking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          total_amount: expectedAmount,
          commission_amount: commission,
          host_earnings: hostEarnings,
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("id", order_id);

      if (updateError) {
        console.error("Webhook: Error updating booking success state:", updateError);
        // Do not return 500, let the webhook retry if it's a DB failure!
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
      }

      // Record the transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          booking_id: order_id,
          user_id: booking.user_id, // Guest user handling the payment
          amount: expectedAmount,
          type: "payment",
          status: "success"
        });

      if (txError) {
        console.error("Webhook: Error creating transaction record:", txError);
      }

      console.info(`[Payment Event] Webhook successfully processed and captured payment for booking ${order_id}`);
      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

    } else {
      
      // Depending on business logic, if it failed we might cancel it, 
      // but only if it's not already paid.
      const { error: failUpdateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", order_id);

      if (failUpdateError) {
        console.error("Webhook: Error updating booking failure state:", failUpdateError);
      }

      return NextResponse.json({ message: "Payment failed/cancelled" }, { status: 200 });
    }

  } catch (error) {
    console.error("Webhook API Route Fatal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
