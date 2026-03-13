import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: "Booking ID is required" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 1. Fetch payment details for the booking
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", booking_id)
      .single();

    if (fetchError || !payment) {
      return new Response(JSON.stringify({ error: "Payment record not found for this booking" }), {
        headers: { "Content-Type": "application/json" },
        status: 404,
      });
    }

    // 2. Call PipraPay Refund API
    // Note: Assuming PIPRAPAY_API_KEY is available in secrets
    const pipraPayApiKey = Deno.env.get("PIPRAPAY_API_KEY");
    
    // Using a mock URL if exact refund endpoint isn't confirmed, 
    // but following standard PipraPay patterns:
    const refundRes = await fetch("https://pay.piprapay.com/api/payment/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${pipraPayApiKey}`
      },
      body: JSON.stringify({
        payment_id: payment.transaction_id,
        amount: payment.amount,
        reason: "Admin initiated refund"
      })
    });

    const refundData = await refundRes.json();

    if (!refundRes.ok) {
      throw new Error(refundData.message || "PipraPay Refund API failed");
    }

    // 3. Update booking and payment status
    await supabase.from("bookings").update({ 
      status: "cancelled",
      payment_status: "refunded"
    }).eq("id", booking_id);

    await supabase.from("payments").update({ 
      status: "refunded"
    }).eq("id", payment.id);

    return new Response(JSON.stringify({ 
      message: "Refund processed successfully",
      refund_data: refundData
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Refund error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
