# API Contract: Payments

**Base Path**: `/api/payments`  
**Content-Type**: `application/json` (except webhook: raw body)  
**Authentication**: Mock JWT (current) — all endpoints use dummy user

---

## GET /packages

List available credit packages.

### Request

No body required.

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "starter",
        "name": "Starter Pack",
        "credits": 50,
        "priceInRupees": 49,
        "priceInPaise": 4900
      },
      {
        "id": "growth",
        "name": "Growth Pack",
        "credits": 100,
        "priceInRupees": 199,
        "priceInPaise": 19900
      },
      {
        "id": "pro",
        "name": "Pro Pack",
        "credits": 150,
        "priceInRupees": 299,
        "priceInPaise": 29900
      }
    ]
  },
  "message": "Packages retrieved successfully"
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 500 | INTERNAL_ERROR | Failed to load packages |

---

## POST /create-order

Create a Razorpay order for the selected package.

### Request Body

```json
{
  "packageId": "growth"
}
```

### Validation Rules

- `packageId`: required, string, must be one of `starter`, `growth`, `pro`

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "orderId": "order_ABC123xyz",
    "amount": 89900,
    "currency": "INR",
    "keyId": "rzp_test_xxx"
  },
  "message": "Order created successfully"
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Invalid or missing packageId |
| 503 | SERVICE_UNAVAILABLE | Razorpay keys not configured or Razorpay API error |

---

## POST /verify

Verify payment signature and add credits.

### Request Body

```json
{
  "orderId": "order_ABC123xyz",
  "paymentId": "pay_DEF456uvw",
  "signature": "abc123...sha256..."
}
```

### Validation Rules

- `orderId`: required, non-empty string
- `paymentId`: required, non-empty string
- `signature`: required, non-empty string

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "creditsAdded": 100,
    "newBalance": 150,
    "transactionId": "ptx_GHI789rst"
  },
  "message": "Payment verified and credits added",
  "meta": {
    "creditsDeducted": 0,
    "remainingCredits": 150
  }
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | BAD_REQUEST | Missing or invalid fields |
| 400 | INVALID_SIGNATURE | Razorpay signature verification failed |
| 409 | DUPLICATE_PAYMENT | Payment already processed |
| 500 | INTERNAL_ERROR | Database or credit service error |

---

## POST /webhook

Receive Razorpay `payment.captured` webhook. **Uses raw body parsing.**

### Request Headers

- `Content-Type`: `application/json`
- `X-Razorpay-Signature`: `t=1234567890,v1=sha256=abc123...`

### Request Body (Raw)

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_DEF456uvw",
        "order_id": "order_ABC123xyz",
        "amount": 89900,
        "status": "captured"
      }
    }
  }
}
```

### Response 200 OK

```json
{
  "success": true,
  "message": "Webhook processed"
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_SIGNATURE | Webhook signature verification failed |
| 409 | DUPLICATE_PAYMENT | Payment already processed |
| 500 | INTERNAL_ERROR | Database or credit service error |

**Important**: Always return 200 for successfully processed webhooks (including duplicates) to prevent Razorpay retry loops. Only return non-200 for genuine errors (e.g., invalid signature).

---

## GET /mode *(Optional Enhancement)*

Return current Razorpay mode for frontend test mode banner.

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "mode": "test"
  },
  "message": "Payment mode retrieved"
}
```

`mode` is `"test"` if `RAZORPAY_KEY_ID` starts with `rzp_test_`, otherwise `"live"`.
