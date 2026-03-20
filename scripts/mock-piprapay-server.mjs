#!/usr/bin/env node
/**
 * PipraPay Mock Gateway Server
 * 
 * Simulates the PipraPay API endpoints locally for integration testing.
 * Supports:
 *   - POST /pay/api/checkout  → Returns a mock payment_url
 *   - POST /pay/api/verify    → Returns mock success/failure
 *   - POST /pay/api/refund    → Returns a mock refund confirmation
 *
 * Usage:
 *   node scripts/mock-piprapay-server.mjs
 * 
 * Then set in your .env.local:
 *   PIPRAPAY_BASE_URL=http://localhost:4242
 *   PIPRAPAY_API_KEY=test_mock_key
 */

import { createServer } from "http";

const PORT = 4242;
const MOCK_API_KEY = "test_mock_key";

// ─── In-Memory Transaction Store ─────────────────────────────────────────────
// Maps transaction_id → payment session data
const sessions = new Map();       // order_id → { transaction_id, amount, status }
const transactions = new Map();   // transaction_id → { order_id, amount, status }

// ─── Utility ─────────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function validateApiKey(req, res) {
  const key = req.headers["x-api-key"];
  if (key !== MOCK_API_KEY) {
    send(res, 401, { error: "Invalid API key" });
    return false;
  }
  return true;
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * POST /pay/api/checkout
 * Initiates a payment session and returns a mock payment_url.
 */
async function handleCheckout(req, res) {
  if (!validateApiKey(req, res)) return;

  const { amount, currency, order_id, success_url, cancel_url } = await readBody(req);

  if (!amount || !order_id || !success_url) {
    return send(res, 400, { error: "Missing required fields: amount, order_id, success_url" });
  }

  // Create a deterministic mock transaction ID
  const transaction_id = `mock_txn_${order_id}_${Date.now()}`;
  const payment_url = `http://localhost:${PORT}/mock-payment-page?txn=${transaction_id}&order=${order_id}&amount=${amount}&success=${encodeURIComponent(success_url)}&cancel=${encodeURIComponent(cancel_url || "")}`;

  // Store the session
  sessions.set(order_id, { transaction_id, amount, status: "pending", currency: currency || "BDT" });
  transactions.set(transaction_id, { order_id, amount, status: "pending" });

  console.log(`[Mock Gateway] 📦 Checkout created: txn=${transaction_id} order=${order_id} amount=${amount}`);
  return send(res, 200, { payment_url, transaction_id });
}

/**
 * POST /pay/api/verify
 * Verifies a transaction by transaction_id.
 * Automatically marks the transaction as "success" on first verify (simulates gateway success).
 */
async function handleVerify(req, res) {
  if (!validateApiKey(req, res)) return;

  const { transaction_id } = await readBody(req);

  if (!transaction_id) {
    return send(res, 400, { error: "Missing transaction_id" });
  }

  const txn = transactions.get(transaction_id);

  if (!txn) {
    console.log(`[Mock Gateway] ❌ Verify failed: transaction_id not found → ${transaction_id}`);
    return send(res, 404, { error: "Transaction not found", status: "FAILED" });
  }

  // Simulate success on verify (first call will succeed)
  if (txn.status === "pending") {
    txn.status = "success";
    transactions.set(transaction_id, txn);
    const session = sessions.get(txn.order_id);
    if (session) {
      session.status = "success";
      sessions.set(txn.order_id, session);
    }
  }

  console.log(`[Mock Gateway] ✅ Verify: txn=${transaction_id} status=${txn.status}`);
  return send(res, 200, {
    status: txn.status === "success" ? "SUCCESS" : "FAILED",
    transaction_id,
    order_id: txn.order_id,
    amount: txn.amount,
  });
}

/**
 * POST /pay/api/refund
 * Issues a mock refund for a transaction.
 */
async function handleRefund(req, res) {
  if (!validateApiKey(req, res)) return;

  const { transaction_id, amount } = await readBody(req);

  if (!transaction_id || amount === undefined) {
    return send(res, 400, { error: "Missing transaction_id or amount" });
  }

  const txn = transactions.get(transaction_id);

  if (!txn) {
    return send(res, 404, { error: "Transaction not found" });
  }

  if (txn.status !== "success") {
    return send(res, 400, { error: "Cannot refund a non-successful transaction" });
  }

  txn.status = "refunded";
  transactions.set(transaction_id, txn);

  console.log(`[Mock Gateway] 💸 Refund processed: txn=${transaction_id} amount=${amount}`);
  return send(res, 200, { success: true, transaction_id, refunded_amount: amount });
}

/**
 * GET /mock-payment-page
 * A simple HTML redirect page simulating the PipraPay hosted payment UI.
 * Clicking "Pay" triggers the success_url; clicking "Cancel" triggers cancel_url.
 */
function handleMockPaymentPage(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const txn = url.searchParams.get("txn");
  const orderId = url.searchParams.get("order");
  const amount = url.searchParams.get("amount");
  const successUrl = decodeURIComponent(url.searchParams.get("success") || "/");
  const cancelUrl = decodeURIComponent(url.searchParams.get("cancel") || "/");

  const successWithTxn = successUrl.includes("?")
    ? `${successUrl}&transaction_id=${txn}`
    : `${successUrl}?transaction_id=${txn}`;

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PipraPay Mock Gateway</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center; }
    .badge { display: inline-block; background: #eef2ff; color: #6c63ff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 99px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #1a202c; margin: 0 0 4px; }
    .subtitle { color: #718096; font-size: 14px; margin-bottom: 24px; }
    .detail { background: #f9fafb; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; text-align: left; }
    .detail p { margin: 5px 0; font-size: 13px; color: #4a5568; }
    .detail strong { color: #1a202c; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; margin-bottom: 10px; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .btn-pay { background: #6c63ff; color: white; }
    .btn-cancel { background: #f3f4f6; color: #4a5568; }
    .note { font-size: 11px; color: #a0aec0; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🧪 Mock Gateway</div>
    <h1>PipraPay Checkout</h1>
    <p class="subtitle">This is a local test simulation of the payment portal</p>
    <div class="detail">
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Transaction ID:</strong> ${txn}</p>
      <p><strong>Amount:</strong> ৳${amount} BDT</p>
    </div>
    <a href="${successWithTxn}">
      <button class="btn btn-pay" onclick="this.textContent='Processing...'">✅ Simulate Successful Payment</button>
    </a>
    <a href="${cancelUrl}">
      <button class="btn btn-cancel">✗ Simulate Cancelled Payment</button>
    </a>
    <p class="note">This mock server runs on localhost:${PORT}. It will not charge any real money.</p>
  </div>
</body>
</html>
  `);
}

/**
 * GET /status — Debug: show all active sessions
 */
function handleStatus(req, res) {
  return send(res, 200, {
    sessions: Object.fromEntries(sessions),
    transactions: Object.fromEntries(transactions),
  });
}

// ─── Main Server ──────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  console.log(`[Mock Gateway] ${req.method} ${url.pathname}`);

  if (req.method === "POST" && url.pathname === "/pay/api/checkout") return handleCheckout(req, res);
  if (req.method === "POST" && url.pathname === "/pay/api/verify")   return handleVerify(req, res);
  if (req.method === "POST" && url.pathname === "/pay/api/refund")   return handleRefund(req, res);
  if (req.method === "GET"  && url.pathname === "/mock-payment-page") return handleMockPaymentPage(req, res);
  if (req.method === "GET"  && url.pathname === "/status")           return handleStatus(req, res);

  send(res, 404, { error: "Route not found on mock gateway" });
});

server.listen(PORT, () => {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║     PipraPay Mock Gateway Server                      ║");
  console.log(`║     Listening on http://localhost:${PORT}               ║`);
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log("║  Set in .env.local:                                   ║");
  console.log(`║    PIPRAPAY_BASE_URL=http://localhost:${PORT}           ║`);
  console.log("║    PIPRAPAY_API_KEY=test_mock_key                     ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log("║  Debug: http://localhost:4242/status                  ║");
  console.log("╚════════════════════════════════════════════════════════╝");
});
