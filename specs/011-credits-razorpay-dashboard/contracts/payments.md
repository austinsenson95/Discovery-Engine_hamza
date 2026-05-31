# API Contracts: Payments & Credits

**Date**: 2026-05-30

## New Endpoints

### GET /api/payments/packages

Retrieve available credit packages.

**Response — Success (200)**:
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "pkg_50",
        "name": "Starter Pack",
        "credits": 50,
        "priceInPaise": 49900,
        "priceDisplay": "₹499"
      },
      {
        "id": "pkg_100",
        "name": "Growth Pack",
        "credits": 100,
        "priceInPaise": 89900,
        "priceDisplay": "₹899"
      },
      {
        "id": "pkg_250",
        "name": "Pro Pack",
        "credits": 250,
        "priceInPaise": 199900,
        "priceDisplay": "₹1,999"
      }
    ]
  }
}
```

---

### POST /api/payments/create-order

Create a Razorpay order for the selected credit package.

**Request Body**:
```json
{
  "packageId": "pkg_50"
}
```

**Response — Success (200)**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_abc123",
      "amount": 49900,
      "currency": "INR",
      "receipt": "receipt_user123_1699000000000"
    },
    "package": {
      "id": "pkg_50",
      "name": "Starter Pack",
      "credits": 50
    },
    "key": "rzp_test_xxxxxxxxxxxx"  // Razorpay Key ID for frontend
  }
}
```

**Response — Error (400 — Invalid Package)**:
```json
{
  "success": false,
  "message": "Invalid credit package ID."
}
```

---

### POST /api/payments/verify

Verify Razorpay payment signature and add credits.

**Request Body**:
```json
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_abc123",
  "razorpay_signature": "signature_hash"
}
```

**Response — Success (200)**:
```json
{
  "success": true,
  "data": {
    "creditsAdded": 50,
    "newBalance": 150
  },
  "message": "Payment successful! 50 credits added to your account."
}
```

**Response — Error (400 — Invalid Signature)**:
```json
{
  "success": false,
  "message": "Payment verification failed. Please contact support."
}
```

**Response — Error (409 — Already Processed)**:
```json
{
  "success": true,
  "data": {
    "creditsAdded": 50,
    "newBalance": 150
  },
  "message": "This payment has already been processed."
}
```

---

### POST /api/payments/webhook

Handle Razorpay payment webhooks for async verification.

**Request Body** (from Razorpay):
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_abc123",
        "order_id": "order_abc123",
        "amount": 49900,
        "status": "captured"
      }
    }
  }
}
```

**Response — Success (200)**:
```json
{ "success": true }
```

**Webhook Signature Verification**:
The backend verifies the `X-Razorpay-Signature` header using `crypto.createHmac('sha256', webhook_secret)`.

---

## Frontend API Functions

### New Functions

```typescript
// app/src/lib/api.ts

export const fetchCreditPackages = async () => {
  const res = await fetchJson<{ data: { packages: CreditPackage[] } }>('/payments/packages');
  return res.data.packages;
};

export const createPaymentOrder = async (packageId: string) => {
  const res = await fetchJson<{
    data: { order: RazorpayOrder; package: CreditPackage; key: string };
  }>('/payments/create-order', { method: 'POST', body: JSON.stringify({ packageId }) });
  return res.data;
};

export const verifyPayment = async (payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) => {
  const res = await fetchJson<{
    data: { creditsAdded: number; newBalance: number };
    message: string;
  }>('/payments/verify', { method: 'POST', body: JSON.stringify(payload) });
  return res.data;
};
```

---

## Razorpay Checkout.js Frontend Contract

### Load SDK

```typescript
const loadRazorpay = (): Promise<any> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve((window as any).Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve((window as any).Razorpay);
    document.body.appendChild(script);
  });
```

### Open Checkout

```typescript
const Razorpay = await loadRazorpay();
const rzp = new Razorpay({
  key: order.key,
  amount: order.amount,
  currency: order.currency,
  name: 'Discovery Engine',
  description: `${pkg.name} — ${pkg.credits} credits`,
  order_id: order.id,
  image: '/logo.png',
  handler: async (response: any) => {
    await verifyPayment({
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
    });
    onSuccess();
  },
  modal: {
    ondismiss: () => onClose(),
    escape: true,
    backdropclose: false,
  },
  theme: {
    color: '#F05A28',
  },
});
rzp.open();
```

### Checkout Options

| Option | Value | Description |
|--------|-------|-------------|
| `key` | `rzp_test_...` | Razorpay Key ID from backend |
| `amount` | `49900` | Amount in paise |
| `currency` | `INR` | Indian Rupee |
| `name` | `Discovery Engine` | Merchant name |
| `description` | `Starter Pack — 50 credits` | Product description |
| `order_id` | `order_abc123` | Razorpay order ID |
| `image` | `/logo.png` | Brand logo |
| `theme.color` | `#F05A28` | Brand orange |
| `modal.ondismiss` | callback | Called when user closes modal |
| `handler` | callback | Called on successful payment |
