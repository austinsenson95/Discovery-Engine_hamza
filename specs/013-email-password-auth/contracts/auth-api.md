# API Contract: Authentication

**Base Path**: `/api/auth`
**Content-Type**: `application/json`
**Authentication**: None (these are the public entry points)

---

## POST /api/auth/register

Create a new user account.

### Request

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

### Validation Schema (Zod)

```typescript
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
```

### Response: 201 Created

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe",
      "credits": 100,
      "language": "english",
      "createdAt": "2026-05-31T10:00:00.000Z",
      "updatedAt": "2026-05-31T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful! Welcome to Discovery Engine."
}
```

### Response: 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed: password must contain at least one uppercase letter, one lowercase letter, and one number."
}
```

### Response: 409 Conflict

```json
{
  "success": false,
  "message": "An account with this email already exists. Please log in."
}
```

---

## POST /api/auth/login

Authenticate an existing user.

### Request

```json
{
  "email": "jane@example.com",
  "password": "SecurePass123"
}
```

### Validation Schema (Zod)

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe",
      "credits": 100,
      "language": "english",
      "createdAt": "2026-05-31T10:00:00.000Z",
      "updatedAt": "2026-05-31T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful!"
}
```

### Response: 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

> **Security Note**: The error message is identical for non-existent email and wrong password to prevent user enumeration.

---

## POST /api/auth/forgot-password

Request a password reset email.

### Request

```json
{
  "email": "jane@example.com"
}
```

### Validation Schema (Zod)

```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
```

### Response: 200 OK (Always)

```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link shortly."
}
```

> **Security Note**: Returns 200 even if email does not exist to prevent user enumeration.

### Side Effects
- If email exists: generates a 32-byte random token, stores SHA-256 hash in `password_resets`, sends email with reset link
- If email does not exist: no action taken (silent fail)

---

## POST /api/auth/reset-password

Reset password using a token from the reset email.

### Request

```json
{
  "token": "a1b2c3d4e5f6...",
  "password": "NewSecurePass456"
}
```

### Validation Schema (Zod)

```typescript
const resetPasswordSchema = z.object({
  token: z.string().length(64), // 32 bytes hex-encoded
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
```

### Response: 200 OK

```json
{
  "success": true,
  "message": "Password updated successfully. Please log in with your new password."
}
```

### Response: 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid or expired reset token. Please request a new password reset."
}
```

### Side Effects
- Hashes new password with bcrypt
- Updates `users.password_hash`
- Sets `password_resets.used_at` on the consumed token
- All existing JWTs for this user remain valid until expiry (new login required for fresh token)

---

## GET /api/user/me

Get current authenticated user profile.

### Headers

```
Authorization: Bearer <jwt_token>
```

### Response: 200 OK

```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JaneDoe",
    "credits": 100,
    "language": "english",
    "createdAt": "2026-05-31T10:00:00.000Z",
    "updatedAt": "2026-05-31T10:00:00.000Z"
  }
}
```

### Response: 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required. Please log in."
}
```

> **Security Note**: `password_hash` is NEVER included in any user response.
