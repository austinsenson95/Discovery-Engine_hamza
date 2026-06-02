# Supabase Setup Guide for Discovery Engine

> Step-by-step instructions to connect your backend to Supabase PostgreSQL.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign up with GitHub (fastest)
3. Click **"New project"**
4. Fill in:
   - **Organization:** Pick or create one (e.g., "personal")
   - **Project name:** `discovery-engine`
   - **Database password:** Generate a strong password (save this!)
   - **Region:** Pick closest to your users (e.g., `Mumbai` for India, `Singapore` for SE Asia, `N. Virginia` for US)
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

---

## Step 2: Get Your Connection String

### 2.1 Open the Settings

1. In your Supabase dashboard, click the **gear icon** (Project Settings) in the left sidebar
2. Click **"Database"** under Configuration

### 2.2 Copy the Connection Pooler URL (Required for Serverless)

> ⚠️ **Important:** Use the **Connection Pooler** URL (port `6543`), NOT the direct URL (port `5432`).
>
> Vercel serverless functions open/close connections on every request. Without connection pooling, you'll hit PostgreSQL's connection limit quickly.

1. Under **"Connection string"** section, look for **"Connection pooler"**
2. Click the copy button next to the URI
3. It looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

**Save this string** — you'll paste it into Vercel.

---

## Step 3: Configure Local Environment

### 3.1 Update Backend `.env`

```bash
cd discovery-engine-backend
```

Open `.env` and replace `DATABASE_URL=` with your Supabase connection string:

```env
# =============================================================================
# Database (Supabase)
# =============================================================================
# Use the Connection Pooler URL (port 6543) from Supabase Dashboard
# Project Settings → Database → Connection pooler → URI
DATABASE_URL=postgresql://postgres.xxxxxxx:YOUR_PASSWORD@aws-0-xxxxx.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3.2 Test Local Connection

Start the backend locally:

```bash
cd discovery-engine-backend
npm run dev
```

On first request, you'll see in the terminal:
```
[DB] PostgreSQL schema initialized
```

If you see an error, check:
- Did you use **port 6543** (not 5432)?
- Is the password correct? (no special characters that need URL-encoding)
- Is `pgbouncer=true` in the URL?

---

## Step 4: Verify Tables Were Created

### 4.1 Check in Supabase Dashboard

1. In Supabase, click **"Table Editor"** in the left sidebar
2. You should see these tables auto-created:
   - `blueprints`
   - `activities`
   - `users`
   - `credit_transactions`
   - `payment_transactions`
   - `password_resets`

### 4.2 Test with a Signup

1. Start the frontend: `cd app && npm run dev`
2. Visit `http://localhost:5174/signup`
3. Create a test user
4. Go to Supabase → Table Editor → `users`
5. You should see your new user row!

---

## Step 5: Deploy to Vercel with Supabase

### 5.1 Add Environment Variable in Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase Connection Pooler URL
   - Click **Save**
5. (Optional but recommended) Add other env vars:
   - `ANTHROPIC_API_KEY` — required for AI generation
   - `JWT_SECRET` — random 32+ character string
   - `FRONTEND_URL` — your deployed frontend URL

### 5.2 Redeploy

```bash
cd discovery-engine-backend
vercel --prod
```

Or click **"Redeploy"** in the Vercel dashboard.

---

## Step 6: Verify Production Connection

1. Visit `https://your-backend.vercel.app/health`
2. Should return: `{"status":"ok", ...}`
3. Sign up on the deployed frontend
4. Check Supabase Table Editor → `users` — new row should appear!

---

## Troubleshooting

### "Connection terminated unexpectedly" or timeouts
- Make sure you're using **port 6543** (Connection Pooler), not 5432
- Verify `pgbouncer=true` is in the connection string

### "password authentication failed"
- Double-check the password in the connection string
- If your password has special characters (`@`, `:`, `#`), URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `#` → `%23`

### Tables not appearing
- The backend creates tables automatically on the **first API request**
- Trigger it by visiting `/health` or signing up
- Check Vercel function logs: `vercel logs --all`

### "Database unavailable" error on frontend
- Check Vercel function logs for the actual error
- Most likely: `DATABASE_URL` is not set or is incorrect

---

## Quick Reference: Supabase URLs

| URL Type | Port | Use Case |
|----------|------|----------|
| Direct connection | 5432 | Local dev, long-running servers |
| Connection Pooler | 6543 | **Serverless (Vercel)** ✅ |

**Always use port 6543 for Vercel.**
