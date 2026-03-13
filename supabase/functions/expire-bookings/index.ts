import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  try {
    // This function can be called by a cron job or a manual trigger
    const now = new Date().toISOString();

    // 1. Find all pending bookings that have expired
    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id")
      .eq("status", "pending")
      .lt("payment_expires_at", now);

    if (fetchError) throw fetchError;

    if (!expiredBookings || expiredBookings.length === 0) {
      return new Response(JSON.stringify({ message: "No expired bookings found" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const expiredIds = expiredBookings.map(b => b.id);

    // 2. Update their status to 'cancelled'
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .in("id", expiredIds);

    if (updateError) throw updateError;

    console.log(`Cancelled ${expiredIds.length} expired bookings: ${expiredIds.join(", ")}`);

    return new Response(JSON.stringify({ 
      message: `Successfully cancelled ${expiredIds.length} expired bookings`,
      cancelled_ids: expiredIds
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in expire-bookings function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
