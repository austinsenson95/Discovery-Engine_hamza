# DISCOVERY ENGINE — Agent Guide

> AI coding agent reference for the DISCOVERY ENGINE full-stack project. Read this first before making any changes.

---

## Project Overview

DISCOVERY ENGINE is an AI-assisted coaching blueprint platform. It helps coaches and consultants discover their niche, define their ideal audience, build a signature program, set pricing, and generate a 12-week launch roadmap — culminating in a downloadable PDF blueprint.

The project is a **full-stack TypeScript application** with a React frontend and an Express.js backend. The backend uses the real Anthropic Claude API for AI generation. The **Blueprint wizard frontend is fully wired to the backend** — all AI steps call real endpoints and surface explicit errors on failure. Other pages (Dashboard, Journey) may still use local mock data.

**Key Concept — The 4-Step Blueprint Wizard:**
1. **Niche Discovery** — User inputs skills, experience, and passions; AI returns 3 recommended niches.
2. **Audience Mapping** — AI generates a detailed persona for the selected niche.
3. **Program Builder** — 3 sub-steps: problem selection, program naming, and pricing strategy.
4. **Roadmap & PDF** — AI generates a 12-week roadmap and triggers PDF creation.

**Credit System:** Users start with 100 credits. Each AI step deducts credits (niche: 10, audience: 10, program name: 5, pricing: 5, roadmap: 15).

---

## Technology Stack

### Frontend (`/app/`)
- **Framework:** React 19.2 + TypeScript 5.9
- **Build Tool:** Vite 7.2.4 (dev server on port 3000)
- **Styling:** Tailwind CSS 3.4.19 + PostCSS + Autoprefixer
- **UI Library:** shadcn/ui ("new-york" style, 40+ Radix-based components in `src/components/ui/`)
- **Routing:** React Router v7
- **Animation:** Framer Motion 12
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod (via `@hookform/resolvers`)
- **Charts:** Recharts
- **Other:** canvas-confetti, embla-carousel-react, next-themes, sonner, vaul

### Backend (`/discovery-engine-backend/`)
- **Runtime:** Node.js 18+ (CommonJS module system)
- **Framework:** Express.js 4.19
- **Language:** TypeScript 5.5
- **Dev Server:** nodemon + ts-node (port 3001)
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Morgan
- **Env Config:** dotenv

---

## Project Structure

```
├── app/                          # Frontend React application
│   ├── src/
│   │   ├── main.tsx              # Entry point: StrictMode + BrowserRouter
│   │   ├── App.tsx               # Root routes (currently only "/")
│   │   ├── index.css             # Tailwind directives + CSS variables (shadcn theme)
│   │   ├── App.css               # App-specific styles
│   │   ├── types/index.ts        # Shared TypeScript types
│   │   ├── pages/                # Top-level page components
│   │   │   ├── Home.tsx          # Dashboard (welcome, stats, progress, activity)
│   │   │   ├── Blueprint.tsx     # 4-step wizard (niche → audience → program → roadmap)
│   │   │   ├── Journey.tsx       # Progress tracking, achievements, activity timeline
│   │   │   └── Profile.tsx       # User settings, preferences, credit history
│   │   ├── components/           # Reusable components
│   │   │   ├── Layout.tsx        # Sidebar + Navbar + Outlet wrapper
│   │   │   ├── Sidebar.tsx       # Navigation drawer (mobile/desktop)
│   │   │   ├── Navbar.tsx        # Top bar with credits, notifications, avatar
│   │   │   ├── NicheCard.tsx     # Niche recommendation display card
│   │   │   ├── PersonaCard.tsx   # Audience persona display card
│   │   │   ├── ProgressBar.tsx   # Linear progress indicator
│   │   │   ├── Stepper.tsx       # Wizard step indicator
│   │   │   └── ui/               # 40+ shadcn/ui components (button, card, dialog, etc.)
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useToast.ts       # Toast notification state manager
│   │   │   └── use-mobile.ts     # Mobile breakpoint detection
│   │   ├── lib/                  # Utilities and data
│   │   │   ├── utils.ts          # `cn()` helper (clsx + tailwind-merge)
│   │   │   ├── api.ts            # API functions (wired to real backend; no mock fallbacks in wizard)
│   │   │   └── mockData.ts       # Frontend dummy data (used by non-wizard pages)
│   │   └── public/               # Static assets (logo, avatar images)
│   ├── index.html                # HTML entry point
│   ├── vite.config.ts            # Vite config with `@/` alias → `./src`
│   ├── tailwind.config.js        # Tailwind theme extensions (shadcn colors, animations)
│   ├── components.json           # shadcn/ui configuration
│   ├── tsconfig.json             # Project references (app + node)
│   ├── tsconfig.app.json         # App TS config (strict, noUnusedLocals, noUnusedParameters)
│   ├── tsconfig.node.json        # Vite config TS config
│   ├── eslint.config.js          # ESLint: recommended + TS + react-hooks + react-refresh
│   └── package.json
│
├── discovery-engine-backend/     # Backend Express API
│   ├── src/
│   │   ├── index.ts              # Express app setup, middleware, routes, server start
│   │   ├── config/index.ts       # Environment variable config + validation
│   │   ├── controllers/
│   │   │   ├── authController.ts # Register, Login (mock auth)
│   │   │   ├── blueprintController.ts # All blueprint wizard steps
│   │   │   └── userController.ts # Profile, Credits
│   │   ├── routes/
│   │   │   ├── auth.ts           # /api/auth/*
│   │   │   ├── blueprint.ts      # /api/blueprint/*
│   │   │   └── user.ts           # /api/user/*
│   │   ├── services/
│   │   │   ├── llmService.ts     # Real Claude API integration (throws explicit errors on failure)
│   │   │   ├── pdfService.ts     # PDF generation PLACEHOLDER
│   │   │   └── creditService.ts  # Credit management (in-memory)
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT auth middleware (mock)
│   │   │   ├── errorHandler.ts   # Global error handler + ApiError class
│   │   │   └── validateRequest.ts # Request body validators (Zod-like manual checks)
│   │   ├── types/index.ts        # TypeScript interfaces (mirrors frontend types)
│   │   └── data/dummyData.ts     # All backend dummy response data
│   ├── tsconfig.json             # TS config: CommonJS, ES2020, strict, outDir ./dist
│   └── package.json
│
├── info.md                       # Branding research and feature requirements
└── freedom-roadmap-reference.png # Visual design reference
```

---

## Build and Development Commands

### Frontend (`cd app/`)

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Vite dev server (`http://localhost:3000`) |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Backend (`cd discovery-engine-backend/`)

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server with nodemon (`http://localhost:3001`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled JS from `dist/` |
| `npm run lint` | Run ESLint on `src/**/*.ts` |
| `npm run typecheck` | Type-check without emitting |

### Running Both
1. Terminal 1: `cd discovery-engine-backend && npm run dev`
2. Terminal 2: `cd app && npm run dev`
3. Frontend runs on `http://localhost:3000`
4. Backend API on `http://localhost:3001`
5. Health check: `curl http://localhost:3001/health`

---

## API Endpoints (Backend)

All routes are prefixed with `/api`. The backend exposes 14 endpoints:

**Auth:**
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user

**User:**
- `GET /api/user/me` — Get current user profile
- `PUT /api/user/profile` — Update profile (name, language, avatar)
- `GET /api/user/credits` — Get credit balance and deduction costs

**Blueprint:**
- `GET /api/blueprint` — Get current blueprint state
- `POST /api/blueprint/niche` — Submit niche form, get 3 AI niche options (10 credits)
- `POST /api/blueprint/audience` — Generate audience persona (10 credits)
- `POST /api/blueprint/problems` — Save selected problems (no credits)
- `POST /api/blueprint/program-name` — Generate program names (5 credits)
- `POST /api/blueprint/pricing` — Generate pricing strategy (5 credits)
- `POST /api/blueprint/roadmap` — Generate 12-week roadmap + PDF (15 credits)
- `GET /api/blueprint/pdf/:id` — Download generated PDF

**Standard Response Shape:**
```json
{
  "success": true,
  "data": { ... },
  "message": "...",
  "meta": {
    "creditsDeducted": 10,
    "remainingCredits": 90,
    "processingTime": 2150
  }
}
```

**Error Codes:**
- `400` — Bad request / missing fields
- `401` — Invalid credentials
- `402` — Insufficient credits
- `404` — Resource not found
- `409` — Email already registered
- `429` — Rate limited
- `500` — Internal server error

---

## Frontend Integration Notes

### Current State: Frontend-Backend Wiring
The **Blueprint wizard** (`src/pages/Blueprint.tsx`) is **fully wired to the backend**. All AI generation steps (niche, persona, problems, program names, pricing, curriculum, roadmap) call real backend endpoints via `src/lib/api.ts`. There are **no silent mock fallbacks** — API failures surface explicit error toasts.

Other pages (Dashboard, Journey, Profile) may still reference `mockData.ts` for development purposes.

To ensure the backend AI works:
1. Set `ANTHROPIC_API_KEY` in `discovery-engine-backend/.env`
2. The backend `llmService.ts` will throw explicit errors if the API key is missing or the Claude API fails
3. Handle `402` responses to show credit top-up UI
4. AI processing takes 1–3 seconds depending on prompt complexity

### Routing
React Router v7 is used with `BrowserRouter` in `main.tsx`. Current routes (defined in `App.tsx`):
- `/` → `Home` (Dashboard)

**Note:** The Sidebar defines additional navigation links (`/blueprint`, `/journey`, `/profile`), but these routes are **not yet registered in `App.tsx`**. The `Layout` component wraps pages with a sidebar and navbar, but is also not yet wired into the router. This is an incomplete area.

### Asset Paths
- Vite `base` is set to `./` (relative paths)
- Alias `@/` resolves to `./src/`

---

## Environment Variables (Backend)

Create `discovery-engine-backend/.env` from the template below:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# JWT (not yet implemented)
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=7d

# LLM API keys (not yet used)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
COHERE_API_KEY=

# Database (not yet implemented)
DATABASE_URL=

LOG_LEVEL=debug
```

The frontend does not use environment variables yet.

---

## Code Style Guidelines

### General
- **Language:** English for all code, comments, and documentation.
- **TypeScript:** Strict mode is enabled in both frontend and backend. Do not disable it.
- **Unused variables:** The frontend TS config has `noUnusedLocals` and `noUnusedParameters` set to `true`. The backend has `strict: true`. Always clean up unused imports and variables.

### Frontend
- **Styling:** Tailwind CSS utility classes. Use the `cn()` helper from `@/lib/utils.ts` for conditional class merging.
- **shadcn/ui:** Components live in `src/components/ui/`. Import them via `@/components/ui/<name>`.
- **Colors:** Follow the established brand palette:
  - Primary/CTA: `#F05A28` (orange) — use `text-orange-500`, `bg-[#F05A28]`
  - Headings/Text: `#0A0A0A` (black)
  - Body: `#4A4A4A` (gray)
  - Success: `#059669` (green)
  - Background: `#FAFAFA` or white
- **Typography:** Headlines use `font-family: 'DM Serif Display', serif` (import via Google Fonts if needed). Emphasize key words with `<span className="italic text-[#F05A28]">`.
- **Badges/Labels:** Uppercase, wide letter-spacing (`tracking-[0.12em]`), small size (`text-[11px]`), rounded-full, semibold.
- **Buttons:** Primary CTA is rounded-full (`rounded-full`), orange gradient, white text. Secondary actions use black (`bg-[#0A0A0A]`).
- **Animation:** Use Framer Motion for page transitions, card hovers (`whileHover`), and staggered reveals. Standard easing: `[0.16, 1, 0.3, 1]`.
- **Icons:** Use `lucide-react`. Icon size is typically `w-5 h-5`.

### Backend
- **Comment Style:** Files begin with a decorative block comment header describing the file's purpose (see existing files for the pattern).
- **Controller Pattern:** Each endpoint handler is an `async` function taking `(req, res, next)`. Use `sendSuccess()` utility for consistent responses. Pass errors to `next(error)`.
- **Logging:** Use `console.log()` with a `[Namespace]` prefix (e.g., `[Blueprint]`, `[LLM]`, `[Error]`).
- **In-Memory Storage:** The backend uses `Map` objects for `blueprintStore` and `userStore`. This is intentional for the demo/harness phase.

---

## Testing

**There are currently no tests in this project.**

- No test framework is installed in either the frontend or backend.
- No test files exist.
- If you add tests, prefer:
  - **Frontend:** Vitest (aligns with Vite) + React Testing Library
  - **Backend:** Jest or Vitest + supertest for HTTP endpoint testing

---

## Security Considerations

### Current State
- **Authentication is MOCKED.** The backend auth controller issues fake JWTs and does not hash passwords. The `authenticate` middleware is a pass-through.
- **No real database.** All data is in-memory and lost on server restart.
- **No input sanitization** beyond basic `express.json()` parsing.

### Existing Security Measures
- `helmet()` sets secure HTTP headers.
- `cors()` restricts origins to `FRONTEND_URL` and `CORS_ORIGINS`.
- `express-rate-limit` protects `/api/*` routes (100 requests per 15 minutes by default).
- `ApiError` class prevents stack trace leakage in production.

### If Hardening
1. Add `bcryptjs` for password hashing.
2. Implement real JWT validation in `middleware/auth.ts`.
3. Add a database (PostgreSQL + Prisma or MongoDB + Mongoose).
4. Sanitize/validate all user inputs (Zod schemas are a good fit).
5. Do not commit `.env` files with real secrets.

---

## Key Files to Know

| File | Why It Matters |
|------|----------------|
| `app/src/App.tsx` | Only has the `/` route. Other routes (blueprint, journey, profile) need to be added here, likely inside `Layout`. |
| `app/src/lib/api.ts` | All wizard API calls connect to the real backend. No mock fallbacks remain in the Blueprint flow. |
| `app/src/lib/mockData.ts` | Single source of truth for frontend dummy data. |
| `app/src/components/Layout.tsx` | Sidebar + Navbar wrapper. Not currently used in routing but should be. |
| `discovery-engine-backend/src/index.ts` | Express server setup. Add new middleware/routes here. |
| `discovery-engine-backend/src/services/llmService.ts` | Real Claude API integration. Throws explicit errors on API failure instead of silently falling back to dummy data. |
| `discovery-engine-backend/src/services/pdfService.ts` | Returns a mock PDF buffer. Replace with Puppeteer/jsPDF/@react-pdf/renderer. |
| `discovery-engine-backend/src/types/index.ts` | Shared contract. Keep in sync with `app/src/types/index.ts`. |

---

## Common Pitfalls

1. **Missing routes:** The Sidebar links to `/blueprint`, `/journey`, and `/profile`, but these routes are not in `App.tsx`. Navigating to them will 404.
2. **Layout not wired:** `Layout.tsx` exists but is not used. Pages render without the sidebar/navbar unless you wrap routes with it.
3. **Type mismatch:** Frontend `RoadmapPhase` has a `color` field; backend `RoadmapPhase` does not. Keep the two `types/index.ts` files aligned.
4. **No real auth:** The backend auth endpoints accept any password. Don't assume auth is production-ready.
5. **Credit system is in-memory:** Credit balances reset on backend restart.
6. **Frontend `noUnusedLocals`:** The TS compiler will fail the build if you leave unused imports or variables.

---

## Future Integration Roadmap (from README/docs)

The backend README contains detailed guides for:
- **LLM Integration:** OpenAI (GPT-4), Anthropic (Claude), Cohere, or local LLMs (Ollama)
- **PDF Generation:** Puppeteer (recommended), jsPDF, or React PDF
- **Real Database:** PostgreSQL + Prisma or MongoDB + Mongoose
- **Real Authentication:** bcryptjs + jsonwebtoken, or OAuth (Passport)
- **Payment Integration:** Stripe/Razorpay for credit top-ups

Refer to `discovery-engine-backend/README.md` for copy-paste-ready integration code snippets.
