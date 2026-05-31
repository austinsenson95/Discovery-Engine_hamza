# Quickstart: Authentication Feature

**For**: Developers implementing the email/password auth system
**Prerequisites**: Node.js 18+, existing Discovery Engine repo cloned, `npm install` run in both `app/` and `discovery-engine-backend/`

## 1. Install Dependencies

### Backend

```bash
cd discovery-engine-backend
npm install bcryptjs jsonwebtoken nodemailer zod
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

### Frontend

No new dependencies required. Uses existing React, React Router, and fetch API.

## 2. Environment Variables

Add to `discovery-engine-backend/.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user@ethereal.email
SMTP_PASS=your-ethereal-password
SMTP_FROM_NAME="Discovery Engine"
SMTP_FROM_EMAIL=noreply@discoveryengine.app

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:3000
```

For production, replace Ethereal with your real SMTP provider (SendGrid, Resend, AWS SES).

## 3. Run Database Migrations

The database migration runs automatically on `npm run dev` via `initDb()` in `db/index.ts`. It will:

1. Add `password_hash` column to `users` table
2. Add `UNIQUE` constraint on `users.email`
3. Create `password_resets` table
4. Seed the dummy user with a random password hash (requires password reset to log in as dummy)

## 4. Start Development Servers

```bash
# Terminal 1: Backend
cd discovery-engine-backend && npm run dev

# Terminal 2: Frontend
cd app && npm run dev
```

## 5. Test the Flow

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123"}'
```

### Log In

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Request Password Reset

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check the Ethereal inbox (link printed in console) for the reset email.

### Reset Password

```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL","password":"NewPass123"}'
```

## 6. Frontend Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/signup` | Sign Up | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password (from email link) | Public |
| `/` | Dashboard | Protected |
| `/blueprint` | Blueprint Wizard | Protected |
| `/journey` | Journey | Protected |
| `/profile` | Profile | Protected |
| `/credits` | Credits | Protected |

## 7. Common Issues

### "Invalid email or password" on login
- Check that the user was actually created (check SQLite DB)
- Verify bcrypt hash is being compared, not plaintext
- Ensure email is lowercased consistently

### "Token expired" on API calls
- Token expiry is 7 days by default
- The frontend should redirect to `/login` on 401 responses

### Email not received in development
- Check console for Ethereal preview URL
- Ethereal emails are captured, not sent to real inboxes
- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are set

### TypeScript errors
- Run `npm run typecheck` in both directories
- Ensure `noUnusedLocals` and `noUnusedParameters` are satisfied
- Check that `User` type includes `passwordHash` in backend but NOT in frontend responses
