import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate Session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Admin Privilege
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userRecord?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Parse Input
    const body = await request.json();
    const { transaction_id, amount } = body;

    if (!transaction_id || amount === undefined) {
      return NextResponse.json({ error: "transaction_id and amount are required" }, { status: 400 });
    }

    console.info(`[Payment Event] Admin refund initiated for transaction_id: ${transaction_id}`);

    const pipraBaseUrl = process.env.PIPRAPAY_BASE_URL;
    const pipraApiKey = process.env.PIPRAPAY_API_KEY;

    if (!pipraBaseUrl || !pipraApiKey) {
      console.error("Refund API: Payment configuration missing");
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 });
    }

    // 1. First, verify the transaction_id to cleanly lookup the associated order_id (booking ID)
    const verifyResponse = await fetch(`${pipraBaseUrl}/verify`, {
      method: "POST",
      headers: {
        "x-api-key": pipraApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id }),
    });

    if (!verifyResponse.ok) {
      console.error("Refund Pre-Verify API Error:", await verifyResponse.text());
      return NextResponse.json({ error: "Could not verify original transaction" }, { status: 400 });
    }

    const verificationData = await verifyResponse.json();
    const order_id = verificationData.order_id;

    if (!order_id) {
      return NextResponse.json({ error: "Invalid transaction mapping, no order_id found" }, { status: 400 });
    }

    // 2. Issue the actual external refund command
    const refundResponse = await fetch(`${pipraBaseUrl}/refund`, {
      method: "POST",
      headers: {
        "x-api-key": pipraApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id, amount }),
    });

    if (!refundResponse.ok) {
      console.error("Refund API Error:", await refundResponse.text());
      return NextResponse.json({ error: "Refund request rejected by payment gateway" }, { status: 502 });
    }

    const refundData = await refundResponse.json();

    // Typically, the gateway returns a success boolean or status inside refundData
    if (refundData.status === "failed" || refundData.success === false) {
      return NextResponse.json({ error: "Gateway failed to process refund", details: refundData }, { status: 400 });
    }

    // 3. Database Updates
    
    // Look up the booking to find the owning user for the transaction ledger
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("user_id")
      .eq("id", order_id)
      .single();

    if (bookingErr || !booking) {
      console.error(`Refund API: Booking ${order_id} not found locally.`);
      // Proceeding without an absolute crash since the refund went through, 
      // but it means our local sync failed partially.
    }

    // Update booking state
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "refunded",
        payment_status: "refunded",
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Refund API: Error updating booking to refunded:", updateError);
    }

    // Insert structured ledger trail for the refund
    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        booking_id: order_id,
        user_id: booking ? booking.user_id : user.id, // Fallback to admin if guest not found
        amount: Number(amount),
        type: "refund",
        status: "success"
      });

    if (txError) {
      console.error("Refund API: Error creating ledger refund transaction record:", txError);
    }

    console.info(`[Payment Event] Refund processed successfully for order_id: ${order_id}`);
    return NextResponse.json({ success: true, message: "Refund processed successfully", order_id });

  } catch (error) {
    console.error("Refund API Route Fatal Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
