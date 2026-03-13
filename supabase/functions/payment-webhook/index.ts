import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const signature = req.headers.get("x-piprapay-signature")
    const webhookSecret = Deno.env.get("PIPRAPAY_WEBHOOK_SECRET")

    // Security check: verify webhook signature if secret is set
    if (webhookSecret && signature !== webhookSecret) {
      console.error("Unauthorized webhook call: signature mismatch");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const transactionId = body.transaction_id || body.payment_id;

    // Audit log: save payload to database
    await supabase.from("payment_logs").insert({ payload: body });

    // 1. Idempotency Check: check if transaction already processed
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existingPayment) {
      console.log(`Webhook already processed for transaction: ${transactionId}`);
      return new Response("Already processed", { status: 200 });
    }

    if (body.status === "paid" || body.status === "success" || body.status === "COMPLETED") {
      // 2. Fetch booking for commission calculation
      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("total_price, commission_rate")
        .eq("id", body.order_id)
        .single();

      if (fetchError || !booking) {
        throw new Error(`Booking not found: ${body.order_id}`);
      }

      const commissionRate = booking.commission_rate || 10;
      const platformFee = (booking.total_price * commissionRate) / 100;
      const hostEarning = booking.total_price - platformFee;

      // 3. Update booking status and financials
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ 
          status: "confirmed",
          platform_fee: platformFee,
          host_earning: hostEarning
        })
        .eq("id", body.order_id);

      if (bookingError) {
        console.error("Error updating booking status:", bookingError);
      }

      // 4. Insert into payments table
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          booking_id: body.order_id,
          amount: body.amount,
          currency: body.currency || "BDT",
          transaction_id: transactionId,
          status: body.status,
          gateway: "PipraPay"
        });

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
      }
    }

    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
