# DISCOVERY ENGINE — Deployment Guide

> Complete guide for deploying the Discovery Engine frontend and backend to Vercel.

---

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
3. PostgreSQL database (Supabase recommended for free tier)
4. Anthropic API key (for AI generation)
5. Razorpay account (optional, for payments)

---

## 1. Backend Deployment (`discovery-engine-backend/`)

### 1.1 Set up PostgreSQL Database

The backend requires PostgreSQL in production. SQLite is only used for local development.

**Option A: Supabase (Recommended — Free tier)**
1. Go to [supabase.com](https://supabase.com) and create a project
2. In Project Settings → Database, copy the **Connection Pooler** URL (port `6543`)
3. It looks like: `postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true`

**Option B: Local/Other PostgreSQL**
- Any PostgreSQL 14+ instance will work

### 1.2 Environment Variables

Create a `.env` file in `discovery-engine-backend/` with these production values:

```env
NODE_ENV=production
PORT=3001

# Your deployed frontend URL (update after frontend deployment)
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# PostgreSQL Database URL (required in production)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true

# Anthropic API Key (required for AI generation)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Razorpay Payment Integration (optional)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Email SMTP (optional, for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME="Discovery Engine"
SMTP_FROM_EMAIL=noreply@discoveryengine.app
```

### 1.3 Deploy to Vercel

```bash
cd discovery-engine-backend

# Login to Vercel (first time only)
vercel login

# Deploy
vercel --prod
```

**Important:** After deployment, copy the backend URL (e.g., `https://discovery-engine-api.vercel.app`) — you'll need it for the frontend.

### 1.4 Vercel Plan Considerations

| Feature | Hobby (Free) | Pro ($20/mo) |
|---------|-------------|--------------|
| Serverless Function Timeout | 10 seconds | 300 seconds |
| AI Endpoints | May timeout for curriculum/roadmap | Recommended |

**Recommendation:** Start with Hobby. If AI endpoints timeout (curriculum/roadmap generation), upgrade to Pro or add response streaming.

---

## 2. Frontend Deployment (`app/`)

### 2.1 Environment Variables

Create a `.env` file in `app/`:

```env
# Your deployed backend URL (from step 1.3)
VITE_API_URL=https://your-backend.vercel.app/api
```

### 2.2 Deploy to Vercel

```bash
cd app

# Login to Vercel (first time only)
vercel login

# Deploy
vercel --prod
```

---

## 3. Post-Deployment Checklist

### 3.1 Update Backend CORS Origins

After deploying the frontend, update the backend environment variable:

```env
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
```

Then redeploy the backend:
```bash
cd discovery-engine-backend
vercel --prod
```

### 3.2 Verify Deployment

Test these endpoints in your browser:
- `https://your-backend.vercel.app/health` → Should return `{"status":"ok"}`
- `https://your-frontend.vercel.app` → Should load the login page

### 3.3 Create Your First User

1. Visit `https://your-frontend.vercel.app/signup`
2. Create an account
3. Login and test the blueprint wizard

---

## 4. Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Check that `FRONTEND_URL` and `CORS_ORIGINS` in the backend match your deployed frontend URL exactly (including `https://`)
2. Redeploy the backend after updating env vars

### Database Connection Errors
If the backend returns "Database unavailable":
1. Verify `DATABASE_URL` is set correctly in Vercel dashboard
2. Check that the database accepts connections from Vercel's IP range
3. For Supabase: use the Connection Pooler URL (port 6543), not the direct URL

### AI Generation Timeouts
If niche/curriculum/roadmap generation times out:
1. **Hobby plan:** Functions timeout after 10s. Curriculum/roadmap calls often take 15-20s.
2. **Solution:** Upgrade to Pro plan (300s timeout) or use a simpler AI model.

### PDF Generation Fails on Vercel
The PDF service uses Puppeteer (`puppeteer-core`) which requires a Chrome/Chromium binary. Vercel's serverless environment does not include Chrome by default.

**Solutions:**
1. **Use `@sparticuz/chromium`** (recommended for serverless):
   ```bash
   npm install @sparticuz/chromium
   ```
   Then modify `src/services/pdfService.ts` to use `@sparticuz/chromium` instead of resolving local Chrome paths.

2. **Deploy backend to Railway/Render** instead of Vercel for full server access with Chrome installed.

3. **Use an external PDF service** like DocRaptor or HTML-to-PDF API.

> The blueprint wizard and all AI generation steps work perfectly on Vercel. Only the final PDF download requires one of the above workarounds.

### 500 Errors on Blueprint Endpoints
Check Vercel function logs:
```bash
vercel logs --all
```

Common causes:
- Missing `ANTHROPIC_API_KEY`
- Database not initialized (first request triggers schema creation)

---

## 5. Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────┐
│   Vercel CDN    │         │  Vercel Serverless│         │   Supabase    │
│  (Frontend)     │  ────▶  │    (Backend API)  │  ────▶  │  PostgreSQL   │
│  React + Vite   │  HTTPS  │   Express.js      │  SSL    │               │
└─────────────────┘         └──────────────────┘         └───────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │  Anthropic Claude │
                           │    (AI Generation)│
                           └──────────────────┘
```

---

## 6. Files Modified for Deployment

| File | Change |
|------|--------|
| `app/vite.config.ts` | Changed `base: './'` to `base: '/'` for absolute asset paths |
| `app/vercel.json` | SPA routing rewrite (already existed) |
| `app/.vercelignore` | Excludes env files and logs |
| `discovery-engine-backend/vercel.json` | Updated to modern `functions` format |
| `discovery-engine-backend/.vercelignore` | Excludes env files and SQLite data |
| `discovery-engine-backend/src/db/index.ts` | SQLite fallback for local dev, PostgreSQL for production |

---

## 7. Next Steps After Deployment

1. **Set up a custom domain** in Vercel dashboard for both frontend and backend
2. **Configure Razorpay webhooks** to point to `https://your-backend.vercel.app/api/payments/webhook`
3. **Set up email SMTP** for password reset functionality
4. **Monitor usage** in Vercel dashboard and Anthropic API console
5. **Consider adding Sentry or LogRocket** for error tracking and user session replay

---

## Quick Deploy Commands

```bash
# Terminal 1: Deploy backend
cd discovery-engine-backend
vercel --prod

# Terminal 2: Deploy frontend
cd app
vercel --prod
```

> **Note:** Always deploy the backend first, then copy its URL into the frontend `.env` before deploying the frontend.
