# DISCOVERY ENGINE — Backend API Harness

> Node.js/Express backend for the DISCOVERY ENGINE platform. Returns dummy data with simulated AI processing delays. Designed for easy integration with real LLM APIs (OpenAI, Claude, Cohere, etc.).

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Auth Endpoints](#auth-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Blueprint Endpoints](#blueprint-endpoints)
- [Credit System](#credit-system)
- [LLM Integration Guide](#llm-integration-guide)
- [PDF Generation Guide](#pdf-generation-guide)
- [Frontend Integration Notes](#frontend-integration-notes)
- [Adding Real Database](#adding-real-database)
- [Adding Real Authentication](#adding-real-authentication)

---

## Overview

This backend API powers the DISCOVERY ENGINE platform — an AI-assisted tool that helps coaches and consultants discover their niche, define their audience, build their program, set pricing, and generate a 12-week launch roadmap.

**Key Features:**
- **RESTful API** with 14 endpoints
- **Simulated AI processing** with realistic 1-3 second delays
- **Credit-based system** for AI generation actions
- **Dummy data** for all responses (ready for LLM swap)
- **PDF generation** placeholder
- **TypeScript** throughout with shared type definitions
- **Security middleware** (Helmet, CORS, rate limiting)
- **Comprehensive error handling**

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Setup Environment

```bash
cp .env.example .env
# Edit .env with your values (optional for demo mode)
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

### Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "discovery-engine-api",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Build for Production

```bash
npm run build      # Compiles TypeScript to dist/
npm start          # Runs compiled code
```

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Entry point — Express app setup
│   ├── config/
│   │   └── index.ts                # Environment variable configuration
│   ├── controllers/
│   │   ├── authController.ts       # Register, Login
│   │   ├── blueprintController.ts  # All blueprint steps
│   │   └── userController.ts       # Profile, Credits
│   ├── routes/
│   │   ├── auth.ts                 # Auth route definitions
│   │   ├── blueprint.ts            # Blueprint route definitions
│   │   └── user.ts                 # User route definitions
│   ├── services/
│   │   ├── llmService.ts           # LLM integration placeholder
│   │   ├── pdfService.ts           # PDF generation placeholder
│   │   └── creditService.ts        # Credit management
│   ├── middleware/
│   │   ├── auth.ts                 # JWT auth middleware (mock)
│   │   ├── errorHandler.ts         # Global error handler
│   │   └── validateRequest.ts      # Request body validators
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── data/
│       └── dummyData.ts            # All dummy response data
├── .env.example                    # Environment variable template
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `CORS_ORIGINS` | — | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | Rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `JWT_SECRET` | `dev-secret-...` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | — | Anthropic/Claude API key |
| `COHERE_API_KEY` | — | Cohere API key |
| `DATABASE_URL` | — | Database connection string |
| `LOG_LEVEL` | `debug` | Logging verbosity |

---

## API Documentation

### Auth Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1718880000000",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JaneSmith",
      "credits": 50,
      "language": "english",
      "createdAt": "2024-06-20T10:00:00.000Z",
      "updatedAt": "2024-06-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful! Welcome to Discovery Engine."
}
```

**Error Codes:**
- `400` — Missing name, email, or password
- `409` — Email already registered

---

#### POST `/api/auth/login`

Log in an existing user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "anypassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful!"
}
```

**Error Codes:**
- `400` — Missing email or password
- `401` — Invalid credentials

---

### User Endpoints

#### GET `/api/user/me`

Get the current user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe",
      "credits": 100,
      "language": "english",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-06-20T10:30:00.000Z"
    }
  }
}
```

---

#### PUT `/api/user/profile`

Update user profile (name, language, avatar).

**Request Body:**
```json
{
  "name": "John Updated",
  "language": "hindi"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "user": { ...updated user... } },
  "message": "Profile updated successfully."
}
```

**Error Codes:**
- `400` — Invalid language (must be "english" or "hindi")
- `404` — User not found

---

#### GET `/api/user/credits`

Get credit balance and all deduction costs.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 100,
    "deductions": {
      "niche": 10,
      "audience": 10,
      "program": 5,
      "pricing": 5,
      "roadmap": 15
    },
    "canAfford": {
      "niche": true,
      "audience": true,
      "program": true,
      "pricing": true,
      "roadmap": true
    }
  }
}
```

---

### Blueprint Endpoints

#### GET `/api/blueprint`

Get the current user's blueprint state.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "bp_001",
    "userId": "usr_001",
    "status": "in_progress",
    "currentStep": 1,
    "progress": 15,
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-20T14:30:00.000Z"
  }
}
```

---

#### POST `/api/blueprint/niche`

Submit niche discovery form and get 3 AI-generated niche options. **Deducts 10 credits.**

**Request Body:**
```json
{
  "skills": "HR, Leadership, Communication",
  "experience": "10 years in HR and team management",
  "passions": "Helping people grow, public speaking, writing"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "niches": [
      {
        "id": "niche_001",
        "name": "Clarity & Confidence Coach for Mid-Career Professionals",
        "whoYouHelp": "Working professionals aged 30-45 who feel stuck in their careers",
        "problemSolved": "Lack of clarity about next career move, imposter syndrome...",
        "resultDelivered": "Clear career direction, renewed confidence, and a concrete action plan...",
        "revenuePotential": "Rs.50K - Rs.2L/month through 1:1 coaching and group programs",
        "marketDemand": 8.5,
        "fitExplanation": "Your HR background gives you insider knowledge...",
        "competitionLevel": "Medium",
        "keywords": ["career clarity", "confidence building", ...]
      },
      ... // 2 more niche options
    ],
    "blueprint": { ...updated blueprint with niche data... }
  },
  "meta": {
    "creditsDeducted": 10,
    "remainingCredits": 90,
    "processingTime": 2150
  }
}
```

**Error Codes:**
- `400` — Missing skills, experience, or passions
- `402` — Insufficient credits

**Processing Time:** ~2 seconds (simulated AI delay)

---

#### POST `/api/blueprint/audience`

Generate a detailed audience persona for the selected niche. **Deducts 10 credits.**

**Request Body:**
```json
{
  "nicheId": "niche_001"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "persona": {
      "id": "persona_001",
      "name": "Kartik",
      "ageRange": "35-45",
      "role": "Senior Manager / Director",
      "location": "Bangalore / Hyderabad",
      "currentSituation": "Kartik has spent 12+ years climbing the corporate ladder...",
      "biggestDesire": "To find meaningful work that aligns with his values...",
      "onlinePlatforms": ["LinkedIn (daily)", "Twitter/X", "Spotify", "YouTube"],
      "payingCapacity": "Rs.25,000 - Rs.75,000 for the right program",
      "painPoints": ["Fear of starting over", "No clear idea what business to start", ...],
      "goals": ["Gain clarity on ideal business direction", "Build confidence", ...],
      "quote": "\"I don't want to regret not trying...\"",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Kartik"
    }
  },
  "meta": {
    "creditsDeducted": 10,
    "remainingCredits": 80,
    "processingTime": 2300
  }
}
```

**Error Codes:**
- `402` — Insufficient credits

**Processing Time:** ~2.2 seconds (simulated AI delay)

---

#### POST `/api/blueprint/problems`

Save selected audience problems (no credit deduction).

**Request Body:**
```json
{
  "selectedProblems": [
    "Fear of starting over at this age",
    "No clear idea what business to start",
    "Analysis paralysis — overthinking every option"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "problems": ["Fear of starting over...", "No clear idea...", "Analysis paralysis..."]
  }
}
```

---

#### POST `/api/blueprint/program-name`

Generate 3 program name suggestions (one AI-recommended). **Deducts 5 credits.**

**Request Body:**
```json
{
  "nicheId": "niche_001",
  "personaId": "persona_001"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "names": [
      {
        "id": "progname_001",
        "name": "Career Clarity Accelerator",
        "description": "A structured 8-week program...",
        "isAiRecommended": false
      },
      {
        "id": "progname_002",
        "name": "The Confident Professional Blueprint",
        "description": "AI-recommended: Combines clarity work with confidence building...",
        "isAiRecommended": true
      },
      {
        "id": "progname_003",
        "name": "Next Chapter Mastery",
        "description": "Premium 12-week transformation...",
        "isAiRecommended": false
      }
    ]
  },
  "meta": {
    "creditsDeducted": 5,
    "remainingCredits": 75,
    "processingTime": 1600
  }
}
```

**Processing Time:** ~1.5 seconds (simulated AI delay)

---

#### POST `/api/blueprint/pricing`

Generate pricing strategy based on persona and program. **Deducts 5 credits.**

**Request Body:**
```json
{
  "programId": "progname_002"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "startingPrice": 4999,
      "priceJustification": "Rs.4,999 is an accessible entry point...",
      "marketInsight": "The Indian online coaching market is growing at 25% YoY...",
      "milestones": {
        "students10": 49990,
        "students50": 249950,
        "students100": 499900
      },
      "priceEvolution": {
        "launch": 4999,
        "after10Students": "Raise to Rs.9,999 (2x)...",
        "premiumTier": "Rs.24,999 for a premium tier with 1:1 coaching..."
      },
      "sweetSpotRange": "Rs.9,999 - Rs.19,999"
    }
  },
  "meta": {
    "creditsDeducted": 5,
    "remainingCredits": 70,
    "processingTime": 1850
  }
}
```

**Processing Time:** ~1.8 seconds (simulated AI delay)

---

#### POST `/api/blueprint/roadmap`

Generate 12-week roadmap and trigger PDF creation. **Deducts 15 credits.**

**Request Body:**
```json
{
  "blueprintId": "bp_001"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roadmap": {
      "phases": [
        {
          "phase": 1,
          "weeks": "Weeks 1-3",
          "title": "Foundation & Validation",
          "items": [
            {
              "week": "Week 1",
              "tasks": [
                "Finalize your niche and target persona",
                "Set up your coaching business structure",
                ...
              ]
            },
            ...
          ]
        },
        ... // 3 more phases (Weeks 4-12)
      ]
    },
    "pdfUrl": "/api/blueprint/pdf/bp_001"
  },
  "meta": {
    "creditsDeducted": 15,
    "remainingCredits": 55,
    "processingTime": 3200
  }
}
```

**Error Codes:**
- `404` — Blueprint not found (complete previous steps first)
- `402` — Insufficient credits

**Processing Time:** ~3 seconds (simulated AI + PDF delay)

---

#### GET `/api/blueprint/pdf/:id`

Download the generated blueprint PDF.

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="discovery-engine-blueprint-bp_001.pdf"

<PDF binary data>
```

**Error Codes:**
- `404` — Blueprint not found

---

## Credit System

The platform uses a credit-based system to manage AI generation usage:

| Action | Endpoint | Cost |
|--------|----------|------|
| Niche Discovery | `POST /api/blueprint/niche` | **10 credits** |
| Audience Persona | `POST /api/blueprint/audience` | **10 credits** |
| Program Name | `POST /api/blueprint/program-name` | **5 credits** |
| Pricing Strategy | `POST /api/blueprint/pricing` | **5 credits** |
| 12-Week Roadmap | `POST /api/blueprint/roadmap` | **15 credits** |

**Total to complete blueprint:** 45 credits

**Free trial:** 50 credits on registration (enough for 1 full blueprint)

### Credit Response

Every credit-deducting endpoint returns `meta` in the response:
```json
{
  "meta": {
    "creditsDeducted": 10,
    "remainingCredits": 90,
    "processingTime": 2150
  }
}
```

### Insufficient Credits (402)

When a user doesn't have enough credits:
```json
{
  "success": false,
  "message": "Insufficient credits. Required: 10, Available: 3. Please top up your credits."
}
```

### Future: Credit Top-ups

To add payment integration:
1. Install Stripe/Razorpay SDK: `npm install stripe`
2. Create payment intent endpoint
3. Add webhook handler for payment confirmation
4. Call `creditService.addCredits(userId, amount)` on successful payment

---

## LLM Integration Guide

Currently, all AI-generated content uses dummy data with simulated delays. Here's how to plug in real LLM APIs:

### Option 1: OpenAI (GPT-4)

```bash
npm install openai
```

Add to `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

In `src/services/llmService.ts`, replace the `generateNicheRecommendations` method:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async generateNicheRecommendations(skills: string, experience: string, passions: string): Promise<NicheOption[]> {
  const prompt = `Generate 3 niche recommendations for a coach with these background details:
    Skills: ${skills}
    Experience: ${experience}
    Passions: ${passions}
    
    Return JSON format with: id, name, whoYouHelp, problemSolved, resultDelivered, 
    revenuePotential, marketDemand (1-10), fitExplanation, competitionLevel, keywords`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '[]');
}
```

### Option 2: Anthropic (Claude)

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async generatePersona(nicheName: string): Promise<Persona> {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [{ role: 'user', content: `Create a detailed persona for: ${nicheName}` }],
  });
  
  return JSON.parse(response.content[0].text);
}
```

### Option 3: Local LLM (Ollama)

For privacy-conscious deployments:
```bash
npm install ollama
```

```typescript
import ollama from 'ollama';

async generateRoadmap(blueprint: Blueprint) {
  const response = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: `Generate a 12-week roadmap...` }],
  });
  
  return JSON.parse(response.message.content);
}
```

### Recommended: Structured Output (Zod + OpenAI)

For type-safe LLM responses:
```bash
npm install zod zod-to-json-schema
```

```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const NicheSchema = z.object({
  id: z.string(),
  name: z.string(),
  whoYouHelp: z.string(),
  // ... etc
});

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  functions: [{ name: 'return_niches', parameters: zodToJsonSchema(NicheSchema) }],
  function_call: { name: 'return_niches' },
});
```

### Caching Strategy

To reduce API costs, implement Redis caching:
```bash
npm install redis ioredis
```

Cache LLM responses keyed by input hash (e.g., hash of skills+experience+passions).

---

## PDF Generation Guide

Currently returns mock PDF content. To generate real PDFs:

### Option 1: Puppeteer (Recommended)

```bash
npm install puppeteer
```

```typescript
import puppeteer from 'puppeteer';

async generateBlueprintPDF(blueprint: Blueprint): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = this.buildHTMLTemplate(blueprint);
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });
  
  await browser.close();
  
  // Upload to S3/Cloudinary
  const url = await uploadToStorage(pdfBuffer, `blueprints/${blueprint.id}.pdf`);
  return url;
}
```

### Option 2: jsPDF (Lightweight)

```bash
npm install jspdf
```

Best for simple, text-heavy PDFs without complex layouts.

### Option 3: React PDF

```bash
npm install @react-pdf/renderer
```

Use React components to design the PDF layout declaratively.

---

## Frontend Integration Notes

### Base URL

```javascript
const API_BASE = 'http://localhost:3001/api';
```

### Axios/Fetch Setup

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  // Include auth token if implemented
  // headers: { Authorization: `Bearer ${token}` }
});
```

### Example: Submit Niche Form

```javascript
const submitNiche = async (skills, experience, passions) => {
  const response = await fetch(`${API_BASE}/blueprint/niche`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, experience, passions }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Niches:', data.data.niches);
    console.log('Credits deducted:', data.meta.creditsDeducted);
    console.log('Remaining credits:', data.meta.remainingCredits);
    return data.data.niches;
  } else {
    console.error('Error:', data.message);
  }
};
```

### Handling Credit Errors (402)

```javascript
if (response.status === 402) {
  // Show credit top-up modal
  showTopUpModal(data.message);
}
```

### Loading States

Each AI endpoint takes 1-3 seconds. Show loading indicators:
- Niche: ~2s
- Audience: ~2.2s
- Program names: ~1.5s
- Pricing: ~1.8s
- Roadmap: ~3s

### CORS

The backend allows requests from `http://localhost:5173` (Vite default). Update `FRONTEND_URL` in `.env` if your frontend runs on a different port.

---

## Adding Real Database

Currently uses in-memory storage. To add a real database:

### PostgreSQL (Prisma)

```bash
npm install prisma @prisma/client
npx prisma init
```

Define schema in `prisma/schema.prisma`, then:
```bash
npx prisma migrate dev
```

### MongoDB (Mongoose)

```bash
npm install mongoose
```

Replace `userStore` and `blueprintStore` Map objects with Mongoose models.

### Redis (for sessions/caching)

```bash
npm install redis ioredis
```

---

## Adding Real Authentication

Currently uses mock authentication. To add real JWT-based auth:

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

1. Hash passwords in `register` controller
2. Verify passwords in `login` controller
3. Issue real JWT tokens
4. Validate tokens in `authenticate` middleware
5. Add refresh token flow
6. Add password reset via email

### OAuth Integration

```bash
npm install passport passport-google-oauth20 passport-linkedin-oauth2
```

---

## License

ISC
