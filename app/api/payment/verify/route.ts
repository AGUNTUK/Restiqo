import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Parse request body
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    console.info(`[Payment Event] Verification initiated for transaction_id: ${transaction_id}`);

    // Call external PipraPay API to verify the transaction
    const pipraBaseUrl = process.env.PIPRAPAY_BASE_URL;
    const pipraApiKey = process.env.PIPRAPAY_API_KEY;

    if (!pipraBaseUrl || !pipraApiKey) {
      console.error("Payment API configuration missing");
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
      console.error("External Payment Verify API Error:", await verifyResponse.text());
      return NextResponse.json({ error: "Verification request failed" }, { status: 502 });
    }

    const verificationData = await verifyResponse.json();
    
    // Validate required fields from the gateway's verified response
    const { status, order_id, amount } = verificationData;
    
    if (!order_id || amount === undefined) {
      return NextResponse.json({ error: "Invalid response from payment service" }, { status: 502 });
    }

    // Secure Database checks using an admin/service client if necessary, or just regular auth
    // Note: Since this might be a server-to-server callback or frontend redirection, 
    // it's safer to not rely on the user session here but strictly on the order_id.
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status, payment_status, total_amount, total_price, user_id")
      .eq("id", order_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const expectedAmount = booking.total_amount || booking.total_price;

    // Validate that the verified amount strictly equals the backend expected amount
    if (Math.abs(Number(amount) - Number(expectedAmount)) > 0.01) {
      console.error(`Amount mismatch: Expected ${expectedAmount}, Verified ${amount}`);
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Determine success or failure
    if (status === "success" || status === "COMPLETED" || status === "SUCCESS") {
      
      // Prevent duplicate processing
      if (booking.status === "confirmed" && booking.payment_status === "paid") {
        return NextResponse.json({ message: "Payment already processed", order_id });
      }

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
        console.error("Error updating booking success state:", updateError);
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
        console.error("Error creating transaction record:", txError);
        // We still return success to frontend since booking payment was captured
      }

      console.info(`[Payment Event] Transaction ${transaction_id} successfully verified and captured for booking ${order_id}`);
      return NextResponse.json({ success: true, order_id, payment_status: "success" });

    } else {
      
      // Update booking to failed/cancelled state
      const { error: failUpdateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "failed",
          status: "cancelled",
        })
        .eq("id", order_id);

      if (failUpdateError) {
        console.error("Error updating booking failure state:", failUpdateError);
      }

      return NextResponse.json({ success: false, error: "Payment was not successful", payment_status: status }, { status: 400 });
    }

  } catch (error) {
    console.error("Verify API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
