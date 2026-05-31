# Quickstart: Testing Razorpay Payments

**Feature**: Live Razorpay Payment Integration  
**Date**: 2026-05-31

---

## Prerequisites

1. Backend server running: `cd discovery-engine-backend && npm run dev` (port 3001)
2. Frontend dev server running: `cd app && npm run dev` (port 3000)
3. Razorpay API keys configured in `discovery-engine-backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```

> **⚠️ IMPORTANT**: Use test keys (`rzp_test_*`) for all development and testing. Live keys (`rzp_live_*`) process real money.

---

## Step 1: Verify Environment

Check that the backend detects your keys on startup:

```bash
curl http://localhost:3001/health
```

You should see the startup banner listing payment endpoints:
```
[Server] Payment routes    → /api/payments/*
```

---

## Step 2: Test Credit Packages Endpoint

```bash
curl http://localhost:3001/api/payments/packages
```

Expected: JSON with 3 packages (Starter, Growth, Pro).

---

## Step 3: Test Order Creation

```bash
curl -X POST http://localhost:3001/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"packageId": "starter"}'
```

Expected: JSON with `orderId`, `amount`, `currency`, `keyId`.

---

## Step 4: Complete a Test Payment (Frontend Flow)

1. Open the frontend at `http://localhost:3000`
2. Navigate to the **Credits** page
3. Click **Buy More Credits**
4. Select the **Starter** package
5. The Razorpay checkout modal opens
6. Use the test card:
   - **Card Number**: `5267 3181 8797 5449`
   - **Expiry**: Any future date (e.g., `12/30`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Name**: Any name
   - **OTP**: `123456` (if prompted)
7. Complete the payment

**Expected Result**: Modal closes, success toast appears, credit balance increases by 50.

---

## Step 5: Verify Transaction History

On the Credits page, scroll to **Transaction History**.

Expected: A new row showing:
- Action: `purchase`
- Amount: `+50`
- Description: Credit package name
- Timestamp: Just now

---

## Step 6: Test Webhook Handling

Since webhooks require a public URL, use ngrok for local testing:

```bash
# Terminal 1: Start ngrok
npx ngrok http 3001

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

1. In your Razorpay Dashboard (Test Mode), go to **Settings → Webhooks**
2. Add a webhook URL: `https://abc123.ngrok.io/api/payments/webhook`
3. Select the event: `payment.captured`
4. Enter a secret (any string) and save

> **Note**: The current implementation uses `RAZORPAY_KEY_SECRET` as the webhook secret. If your Razorpay webhook uses a different secret, the backend config needs to support `RAZORPAY_WEBHOOK_SECRET`.

5. Repeat Step 4 (complete a test payment)
6. Check backend logs for `[Payment] Webhook received` and `[Payment] Credits added via webhook`

**Expected Result**: Credits added via webhook even if frontend verify callback is bypassed.

---

## Step 7: Test Failure Scenarios

### Test: Abandoned Checkout
1. Open Credit Purchase Modal
2. Close the modal without completing payment
3. Check `payment_transactions` table — status should remain `created`
4. Credit balance should not change

### Test: Invalid Signature (Verify)
1. Send a verify request with a tampered signature:
   ```bash
   curl -X POST http://localhost:3001/api/payments/verify \
     -H "Content-Type: application/json" \
     -d '{"orderId":"order_xxx","paymentId":"pay_xxx","signature":"fake"}'
   ```
2. Expected: 400 `INVALID_SIGNATURE`

### Test: Duplicate Payment
1. Note the `paymentId` from a successful payment
2. Send the same verify request again
3. Expected: 409 `DUPLICATE_PAYMENT`

---

## Step 8: Test Within Blueprint Wizard

1. Start the Blueprint wizard
2. Use credits until balance is low
3. Attempt an AI step (e.g., Niche Discovery) with insufficient credits
4. The **Credit Purchase Modal** should appear automatically
5. Complete a test payment
6. Retry the AI step — it should proceed without losing wizard progress

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `503 SERVICE_UNAVAILABLE` on create-order | Razorpay keys missing in `.env` | Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` |
| Webhook returns 400 every time | Raw body not captured | Ensure webhook route uses `express.raw()` before `express.json()` |
| Credits not added after payment | Signature mismatch | Verify `orderId` + `paymentId` + `signature` are correct |
| Duplicate credit addition | Race condition | Check DB has UNIQUE constraint on `razorpay_payment_id` |
| "Buy Credits" button does nothing | Razorpay Checkout.js not loaded | Check browser console for script load errors |

---

## Razorpay Dashboard Links

- **Test Mode**: https://dashboard.razorpay.com/app/dashboard?mode=test
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Webhook Docs**: https://razorpay.com/docs/webhooks/
