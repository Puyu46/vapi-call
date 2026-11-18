# Agent Demo API — vAPI Call listing (Vercel)

Paid x402 demo API for the vAPI "List your API" quest (500 pts).
- `POST /paid` — $0.005 USDC on Base (eip155:8453), paid to the agent wallet
  `0xB47aC53d94fdfF1C78692E0A09C4Df5Beae8cf32`
- `GET /openapi.json` — OpenAPI with `x-payment-info`
- `GET /` — service info

## Deploy to Vercel (free Hobby tier)

Prerequisite: a computer with Node.js installed.

```bash
npm i -g vercel
cd vapi-call-vercel
vercel
```

Follow the prompts (log in, accept the project name, no framework preset
needed — it deploys as a serverless function). When it finishes, Vercel
prints a public URL like `https://vapi-call-vercel.vercel.app`.
Send that URL back to the agent so it can publish the listing on vAPI.

## Run locally

```bash
npm install
node index.mjs   # listens on http://localhost:4242
```

## Verify before publishing

```bash
vapi check https://<your-url>/paid --method POST
# expected: 9 passed, 2 warnings (extensions + discovery doc), 0 failed
```
