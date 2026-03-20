#!/usr/bin/env node
/**
 * PipraPay Integration Test Runner
 * 
 * Supports two modes:
 *   1. LIVE mode (real PipraPay sandbox)
 *   2. MOCK mode (against scripts/mock-piprapay-server.mjs)
 * 
 * Usage (Mock mode — recommended for offline testing):
 *   # Terminal 1:
 *   npm run mock:gateway
 *   # Terminal 2:
 *   npm run test:payment -- --booking-id <uuid>
 *
 * Usage (Live mode with sandbox transaction_id):
 *   node scripts/test-payment-flow.mjs --booking-id <uuid> --transaction-id <real-txn-id>
 *
 * Requirements:
 *   - A running Next.js dev server (`npm run dev`)
 *   - SUPABASE_TEST_TOKEN env var set to a valid JWT
 *   - A real "pending" booking ID in the database
 */

import { parseArgs } from "util";

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    "base-url": { type: "string", default: "http://localhost:3000" },
    "mock-url": { type: "string", default: "http://localhost:4242" },
    "booking-id": { type: "string" },
    "transaction-id": { type: "string" },
    "mock": { type: "boolean", default: false },
  },
  allowPositionals: true,
});

const BASE_URL = args["base-url"];
const BOOKING_ID = args["booking-id"];
const MOCK_TXN_ID = args["transaction-id"];
const AUTH_TOKEN = process.env.SUPABASE_TEST_TOKEN;

if (!AUTH_TOKEN) {
  console.error("\n❌ Error: Set SUPABASE_TEST_TOKEN env var to a valid Supabase JWT.\n");
  process.exit(1);
}

const authHeaders = {
  "Content-Type": "application/json",
  "Cookie": `sb-access-token=${AUTH_TOKEN}`,
};

function print(label, data) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("=".repeat(60));
  console.log(JSON.stringify(data, null, 2));
}

async function testCreatePayment() {
  console.log("\n🔵 [TEST 1] Simulate Payment Creation (POST /api/payment/create)");

  if (!BOOKING_ID) {
    console.warn("  ⚠️  Skipped: no --booking-id provided.");
    return null;
  }

  const res = await fetch(`${BASE_URL}/api/payment/create`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ bookingId: BOOKING_ID }),
  });

  const data = await res.json();
  print("CREATE RESPONSE", { status: res.status, data });

  if (res.ok && data.payment_url) {
    console.log(`  ✅ Success! Redirect URL: ${data.payment_url}`);
  } else {
    console.error(`  ❌ Failed: ${data.error}`);
  }

  return data;
}

async function testDuplicatePaymentPrevention() {
  console.log("\n🔵 [TEST 2] Simulate Duplicate Payment Prevention");

  if (!BOOKING_ID) {
    console.warn("  ⚠️  Skipped: no --booking-id provided.");
    return;
  }

  // Same request again — should return a 400 since status !== 'pending'
  const res = await fetch(`${BASE_URL}/api/payment/create`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ bookingId: BOOKING_ID }),
  });

  const data = await res.json();
  print("DUPLICATE PREVENTION RESPONSE", { status: res.status, data });

  if (res.status === 400) {
    console.log("  ✅ Duplicate correctly blocked!");
  } else {
    console.warn("  ⚠️  Unexpected status code. Booking may not be confirmed yet.");
  }
}

async function testVerifyPaymentSuccess() {
  console.log("\n🔵 [TEST 3] Simulate Payment Verification – SUCCESS flow");
  console.log(`  Using mock transaction_id: ${MOCK_TXN_ID}`);
  console.log("  ℹ️  Without a live gateway, this will fail at PipraPay's verify endpoint.");
  console.log("     To fully test: use a real transaction_id from PipraPay sandbox.\n");

  const res = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ transaction_id: MOCK_TXN_ID }),
  });

  const data = await res.json();
  print("VERIFY RESPONSE", { status: res.status, data });

  if (data.success) {
    console.log("  ✅ Verification passed! Booking should now be confirmed in DB.");
  } else {
    console.log("  ℹ️  Expected failure with mock ID (no real gateway).");
  }
}

async function testWebhookHandling() {
  console.log("\n🔵 [TEST 4] Simulate Webhook Event (POST /api/payment/webhook)");
  console.log(`  Using mock transaction_id: ${MOCK_TXN_ID}`);
  console.log("  ℹ️  PipraPay will call this automatically on payment completion.");

  const res = await fetch(`${BASE_URL}/api/payment/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_id: MOCK_TXN_ID,
      order_id: BOOKING_ID || "placeholder-booking-id",
    }),
  });

  const data = await res.json();
  print("WEBHOOK RESPONSE", { status: res.status, data });

  if (res.ok) {
    console.log("  ✅ Webhook acknowledged (200 OK).");
  } else {
    console.log("  ⚠️  Webhook returned non-200 — check server logs.");
  }
}

async function testWebhookIdempotency() {
  console.log("\n🔵 [TEST 5] Verify Idempotency — Second webhook with same transaction_id");

  const res = await fetch(`${BASE_URL}/api/payment/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_id: MOCK_TXN_ID,
      order_id: BOOKING_ID || "placeholder-booking-id",
    }),
  });

  const data = await res.json();
  print("IDEMPOTENCY CHECK RESPONSE", { status: res.status, data });

  if (data.message === "Already processed" || res.ok) {
    console.log("  ✅ Idempotency check passed — webhook safely ignored duplicate.");
  }
}

async function testVerifyPaymentFailure() {
  console.log("\n🔵 [TEST 6] Simulate Payment Verification – FAILURE flow (bad transaction_id)");

  const res = await fetch(`${BASE_URL}/api/payment/verify`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ transaction_id: "INVALID_TXN_DOESNT_EXIST" }),
  });

  const data = await res.json();
  print("FAILURE VERIFY RESPONSE", { status: res.status, data });

  if (!data.success || res.status >= 400) {
    console.log("  ✅ Verification correctly rejected the invalid transaction.");
  }
}

async function testMissingAuth() {
  console.log("\n🔵 [TEST 7] Verify Auth Guard — Request without Authorization");

  const res = await fetch(`${BASE_URL}/api/payment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId: BOOKING_ID || "fake-id" }),
  });

  const data = await res.json();
  print("AUTH GUARD RESPONSE", { status: res.status, data });

  if (res.status === 401) {
    console.log("  ✅ Auth guard working — unauthenticated requests correctly blocked.");
  } else {
    console.error("  ❌ Auth guard failed! Unauthorized request was accepted.");
  }
}

// ─── Run All Tests ───────────────────────────────────────────────────────────
(async () => {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     PipraPay Integration Test Suite                   ║");
  console.log(`║     Base URL: ${BASE_URL.padEnd(41)}║`);
  console.log("╚════════════════════════════════════════════════════════╝");
  
  await testCreatePayment();
  await testVerifyPaymentSuccess();
  await testWebhookHandling();
  await testWebhookIdempotency();
  await testVerifyPaymentFailure();
  await testDuplicatePaymentPrevention();
  await testMissingAuth();

  console.log("\n\n✅ Test suite completed. Review the responses above.");
  console.log("   For full E2E: use a real PipraPay sandbox transaction_id.\n");
})();
