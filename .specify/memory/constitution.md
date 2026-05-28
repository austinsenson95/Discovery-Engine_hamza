<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Initial constitution draft from AGENTS.md project context
- Added sections: Core Principles, Technology Constraints, Domain Model, Quality Gates, Security Stance, Development Workflow
- Templates requiring updates: none (first version)
- Follow-up TODOs: None
-->

# DISCOVERY ENGINE Constitution

## Core Principles

### I. TypeScript Strictness is Non-Negotiable
Every line of code in both frontend (`app/`) and backend (`discovery-engine-backend/`) MUST be written in TypeScript with strict mode enabled. The frontend enforces `noUnusedLocals` and `noUnusedParameters`. The backend enforces `strict: true`. No exceptions. No `@ts-ignore` without a documented rationale. Clean up unused imports and variables before every commit.

**Rationale**: This project handles financial-adjacent data (credit systems, pricing strategies) and user-generated coaching blueprints. Type safety prevents entire classes of runtime errors that would destroy user trust in an AI-assisted platform.

### II. The 4-Step Wizard is the Sacred User Journey
All features, UI changes, and API modifications MUST preserve and enhance the 4-step blueprint wizard as the primary user flow:
1. **Niche Discovery** → 3 AI-recommended niches
2. **Audience Mapping** → Detailed persona generation
3. **Program Builder** → Problem selection → Naming → Pricing
4. **Roadmap & PDF** → 12-week launch plan + downloadable blueprint

Any feature that disrupts this flow requires explicit user-testing justification and a rollback plan.

**Rationale**: The wizard IS the product. Coaches and consultants pay for the transformation from "I have skills" to "I have a complete launch plan." Breaking the wizard breaks the value proposition.

### III. Brand Consistency Across Every Surface
The Discovery Engine visual identity MUST be maintained in every UI component:
- **Primary CTA**: `#F05A28` (orange) — `text-orange-500`, `bg-[#F05A28]`
- **Headings**: `#0A0A0A` (black), DM Serif Display font family
- **Body text**: `#4A4A4A` (gray)
- **Success states**: `#059669` (green)
- **Background**: `#FAFAFA` or white
- **Badges/Labels**: Uppercase, `tracking-[0.12em]`, `text-[11px]`, `rounded-full`, semibold
- **Buttons**: Primary = `rounded-full` orange gradient; Secondary = `bg-[#0A0A0A]`
- **Emphasis**: `<span className="italic text-[#F05A28]">` for key words in headlines
- **Animation**: Framer Motion with easing `[0.16, 1, 0.3, 1]`
- **Icons**: Lucide React at `w-5 h-5`

Use the `cn()` helper from `@/lib/utils.ts` for all conditional class merging. shadcn/ui components live in `src/components/ui/` and are imported via `@/components/ui/<name>`.

**Rationale**: Inconsistent branding makes an AI-assisted platform feel cheap and untrustworthy. Coaches are selling transformation — the tool itself must look transformative.

### IV. Backend-First Data Persistence
All user-generated data MUST be stored in the SQLite database (`discovery-engine-backend/data/discovery-engine.db`) via `better-sqlite3`. The in-memory `Map` stores (`blueprintStore`, `userStore`) are deprecated and MUST be migrated to SQLite.

- JSON fields (`niche`, `audience`, `program`, `roadmap`) MUST use `JSON.stringify()` on write and `JSON.parse()` on read.
- The `blueprints` table is the single source of truth for wizard state.
- Credit transactions MUST be recorded in a `credit_transactions` table (to be created).

**Rationale**: Data loss on server restart is unacceptable for a coaching platform where users invest credits and time building their blueprint.

### V. Real AI or Nothing
The `llmService.ts` placeholder (`setTimeout` + dummy data) MUST be replaced with a real LLM integration (Claude, OpenAI, or local via Ollama) before any new AI-powered features are added.

- Each wizard step MUST have a dedicated, engineered prompt.
- JSON parsing MUST have a fallback to dummy data on LLM failure.
- Cost optimization: target ~$0.032 per complete blueprint.
- Response caching MUST be implemented for repeated similar inputs.

**Rationale**: Coaches will quickly detect fake AI output. The platform's credibility depends on genuinely useful, personalized recommendations.

## Technology Constraints

### Approved Stack
| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | React 19.2 + TypeScript 5.9 | Latest stable, StrictMode |
| Build Tool | Vite 7.2.4 | Fast dev server on port 3000 |
| Styling | Tailwind CSS 3.4.19 + PostCSS | Utility-first, brand palette enforceable |
| UI Components | shadcn/ui "new-york" | 40+ Radix-based accessible components |
| Routing | React Router v7 | BrowserRouter in `main.tsx` |
| Animation | Framer Motion 12 | Brand easing `[0.16, 1, 0.3, 1]` |
| Forms | React Hook Form + Zod | Type-safe validation |
| Charts | Recharts | Dashboard analytics |
| Backend Runtime | Node.js 18+ | CommonJS module system |
| Backend Framework | Express.js 4.19 | Mature, well-documented |
| Database | SQLite + `better-sqlite3` | Zero-config, file-based, fast |
| Auth (current) | Mock JWT | MUST be replaced with real JWT + bcryptjs |
| LLM (target) | Claude 3.5 Sonnet / GPT-4 | Best reasoning for coaching domain |
| PDF Generation (target) | Puppeteer / jsPDF | Real PDF from blueprint data |

### Forbidden Technologies
- No new CSS-in-JS libraries (Styled Components, Emotion) — Tailwind only
- No new UI component libraries (Material-UI, Ant Design) — shadcn/ui only
- No new state management libraries (Redux, MobX) — React state + Context sufficient
- No new backend frameworks (Fastify, NestJS) — Express only
- No new databases (MongoDB, PostgreSQL) — SQLite only until scaling demands otherwise

## Domain Model

### Core Entities
1. **Blueprint** — The central aggregate. Represents a user's complete coaching business blueprint.
   - `id`, `userId`, `status`, `currentStep`, `progress`
   - `niche` (JSON): `{ selected, options }`
   - `audience` (JSON): `{ persona }`
   - `program` (JSON): `{ problems, name, pricing }`
   - `roadmap` (JSON): `{ phases, pdfUrl }`
   - `title`, `createdAt`, `updatedAt`

2. **User** — Coach/consultant using the platform.
   - `id`, `email`, `name`, `avatar`, `language`
   - `credits` (current balance)
   - `preferences`

3. **Credit Transaction** — Immutable ledger of credit usage.
   - `id`, `userId`, `blueprintId`, `amount`, `reason`, `createdAt`

### Credit Costs (Fixed)
| Step | Cost |
|---|---|
| Niche Discovery | 10 |
| Audience Mapping | 10 |
| Program Naming | 5 |
| Pricing Strategy | 5 |
| Roadmap & PDF | 15 |
| **Total per blueprint** | **45** |

## Quality Gates

### Before Every Commit
1. **TypeScript compilation passes** in both frontend and backend
2. **ESLint passes** (`npm run lint` in both directories)
3. **No unused imports or variables**
4. **Build succeeds** (`npm run build` in both directories)
5. **Database schema is documented** if migrations added

### Before Every Feature Merge
1. **End-to-end wizard flow tested** — all 4 steps + sub-steps + back navigation + reset
2. **Database persistence verified** — blueprint survives page refresh
3. **Credit deduction verified** — correct amounts deducted at correct steps
4. **Brand consistency checked** — no rogue colors, fonts, or button styles
5. **Mobile responsiveness verified** — Sidebar, wizard forms, cards

### Testing Standards
- **Frontend**: Vitest + React Testing Library (to be installed)
- **Backend**: Vitest + supertest for HTTP endpoints (to be installed)
- **Minimum coverage**: 70% for new code
- **Critical paths** (wizard steps, credit transactions, auth) MUST have integration tests

## Security Stance

### Current (Acknowledged Debt)
- Auth is mocked — fake JWTs, no password hashing
- No real database — in-memory data lost on restart
- No input sanitization beyond `express.json()`

### Hardening Roadmap (Priority Order)
1. `bcryptjs` for password hashing
2. Real JWT validation in `middleware/auth.ts`
3. Zod schemas for all request body validation
4. Rate limiting per-user (not just per-IP)
5. `.env` secrets management (never commit real keys)

## Development Workflow

### Branch Naming
- `feat/###-short-name` — new features
- `fix/###-short-name` — bug fixes
- `docs/###-short-name` — documentation
- `chore/###-short-name` — maintenance

### Commit Messages
Follow conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `style:` formatting, missing semicolons, etc.
- `refactor:` code change that neither fixes a bug nor adds a feature
- `test:` adding tests
- `chore:` maintenance tasks

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] shadcn/ui + Tailwind usage (no custom CSS unless justified)
- [ ] Brand color palette adherence
- [ ] Error handling with `next(error)` pattern in backend
- [ ] Frontend API functions use real backend (not mock data)
- [ ] Database operations use repository pattern
- [ ] No secrets in code

## Governance

This constitution supersedes all other development practices for the Discovery Engine project.

- **Amendments**: Proposed via PR with rationale, reviewed against existing principles, requires explicit approval.
- **Versioning**: Semantic — MAJOR for principle changes, MINOR for new constraints, PATCH for clarifications.
- **Compliance**: All PRs must verify constitution compliance. Complexity must be justified with reference to user value.
- **Runtime guidance**: Use `AGENTS.md` for day-to-day agent context; this constitution for architectural decisions.

**Version**: 1.0.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-27
