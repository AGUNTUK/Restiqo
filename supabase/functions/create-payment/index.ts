import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const apiKey = Deno.env.get("PIPRAPAY_API_KEY");

    if (!apiKey) {
      throw new Error("PIPRAPAY_API_KEY is not set in secrets");
    }

    const res = await fetch("https://restiqa.com/pay/api/checkout/redirect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        full_name: body.full_name || "Guest User",
        email_address: body.email || "guest@restiqa.com",
        mobile_number: body.mobile || "01700000000",
        amount: body.amount,
        currency: "BDT",
        return_url: "https://restiqa.com/payment-success",
        webhook_url: "https://cxbblxejgiarqmstxpck.supabase.co/functions/v1/payment-webhook",
        metadata: {
          booking_id: body.booking_id || body.bookingId
        }
      })
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Payment creation error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
