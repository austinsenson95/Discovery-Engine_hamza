# Quickstart: Credits Dashboard & Razorpay Integration

**Date**: 2026-05-30

## Prerequisites

- Node.js 18+ installed
- Razorpay test account created at https://dashboard.razorpay.com/
- Razorpay test `key_id` and `key_secret` obtained

## Environment Setup

```bash
# Backend .env — add these lines
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## Start Development Servers

```bash
# Terminal 1: Backend
cd discovery-engine-backend
npm install  # installs razorpay package
npm run dev
# Server runs on http://localhost:3001

# Terminal 2: Frontend
cd app
npm run dev
# Server runs on http://localhost:3000
```

## Test the Feature

### 1. Verify Credits Dashboard

1. Navigate to `http://localhost:3000/credits`
2. **Expected**: Credits Dashboard loads with:
   - Current balance displayed prominently
   - Credit transaction history table
   - AI step cost breakdown
   - Purchase packages (Starter ₹499, Growth ₹899, Pro ₹1,999)
3. **Verify**: All data loads in under 2 seconds

### 2. Verify Razorpay Checkout

1. On the Credits Dashboard, click "Buy" on the Starter Pack
2. **Expected**: Razorpay Checkout modal opens with:
   - Merchant name: "Discovery Engine"
   - Amount: ₹499
   - Brand color: orange (#F05A28)
3. Use Razorpay test card:
   - Card number: `5267 3181 8797 5449`
   - Expiry: any future date
   - CVV: any 3 digits
   - OTP: `1234`
4. **Expected**: Payment succeeds, modal closes, success toast appears, credit balance updates

### 3. Verify 402 Purchase Modal in Wizard

1. Navigate to Blueprint wizard
2. Exhaust credits by triggering AI steps until balance reaches 0
3. Attempt another AI generation step
4. **Expected**: Branded purchase modal appears instead of error toast
5. Complete payment in the modal
6. **Expected**: Modal closes, wizard auto-retries the AI step, result appears

### 4. Verify Webhook Idempotency

1. Complete a purchase via the Credits Dashboard
2. Simulate Razorpay retrying the webhook:
   ```bash
   curl -X POST http://localhost:3001/api/payments/webhook \
     -H "Content-Type: application/json" \
     -H "X-Razorpay-Signature: <valid_signature>" \
     -d '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_abc123","order_id":"order_abc123","amount":49900,"status":"captured"}}}}'
   ```
3. **Expected**: Second webhook returns 200 but does NOT add duplicate credits

### 5. Verify Credit Transaction History

1. After purchasing credits, navigate to `/credits`
2. Scroll to the transaction history table
3. **Expected**: The purchase appears as a row with:
   - Date and time
   - Action: "Purchased Starter Pack"
   - Amount: +50 (green)
   - Running balance

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| "Razorpay not loaded" error | Checkout.js script failed to load | Check network connectivity; verify script URL |
| "Invalid signature" on verify | Razorpay key mismatch | Verify `RAZORPAY_KEY_SECRET` in `.env` matches Razorpay dashboard |
| Credits not added after payment | Webhook not received or verify failed | Check backend logs; verify payment status in Razorpay dashboard |
| Duplicate credits added | Idempotency not working | Check `payment_transactions` table for unique constraint on `razorpay_payment_id` |
| 402 modal not appearing | Error handler not updated | Verify `Blueprint.tsx` catches 402 and opens `CreditPurchaseModal` |
| Dashboard route 404s | Route not registered | Verify `/credits` route added to `App.tsx` |

## Verify Changes

```bash
# Backend type-check
cd discovery-engine-backend && npm run typecheck

# Frontend type-check
cd app && npx tsc --noEmit

# Check Razorpay package installed
cd discovery-engine-backend && npm list razorpay
```
