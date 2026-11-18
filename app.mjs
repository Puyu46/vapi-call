import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
const facilitator = "https://x402.org/facilitator";
// Payout wallet: the linked vAPI agent wallet (main). Proofs are signed with this wallet.
const payTo = "0xB47aC53d94fdfF1C78692E0A09C4Df5Beae8cf32";
const offer = {
  x402Version: 2,
  error: "Payment required",
  resource: { url: "/paid", description: "A paid demo resource from the agent's own API.", mimeType: "application/json", serviceName: "Agent Demo API" },
  accepts: [{ scheme: "exact", network: "eip155:8453", amount: "5000", asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", payTo, maxTimeoutSeconds: 120,
    extra: { name: "USD Coin", version: "2" } }],
};

app.use("*", cors({ origin: "*", exposeHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE"] }));
app.get("/openapi.json", (c) => c.json({ openapi: "3.0.3", info: { title: "Agent Demo API", version: "1.0.0" }, paths: { "/paid": { post: { "x-payment-info": offer.accepts[0], responses: { "200": { description: "Paid response" }, "402": { description: "Payment required" } } } } } }));
app.get("/", (c) => c.json({ service: "Agent Demo API", paid: "/paid", price: "0.005 USDC on Base", payTo }));
app.post("/paid", async (c) => {
  const encoded = c.req.header("PAYMENT-SIGNATURE");
  if (!encoded) return c.json(offer, 402, { "PAYMENT-REQUIRED": btoa(JSON.stringify(offer)) });
  let payment;
  try { payment = JSON.parse(atob(encoded)); } catch { return c.json({ error: "Invalid payment" }, 400); }
  const body = { x402Version: 2, paymentPayload: payment, paymentRequirements: offer.accepts[0] };
  const headers = { "content-type": "application/json" };
  const verify = await fetch(`${facilitator}/verify`, { method: "POST", headers, body: JSON.stringify(body) });
  const verified = await verify.json();
  if (!verify.ok || !verified.isValid) return c.json({ error: "Payment verification failed" }, 402);
  const settle = await fetch(`${facilitator}/settle`, { method: "POST", headers, body: JSON.stringify(body) });
  const settlement = await settle.json();
  if (!settle.ok || !settlement.success) return c.json({ error: "Payment settlement failed" }, 502);
  return c.json({ resource: offer.resource, message: "Hello from the Agent Demo API. Payment received." }, 200, { "PAYMENT-RESPONSE": btoa(JSON.stringify(settlement)) });
});

export default app;
