# Template Contract: PDF Blueprint Generation

**Date**: 2026-05-28

## Template System

The PDF is generated from HTML templates compiled into a single document and rendered by Puppeteer. All styling is inline or in a `<style>` block within the `<head>`.

## Brand Specification (Enforced)

| Element | Value | CSS Example |
|---|---|---|
| Primary accent | `#F05A28` | `color: #F05A28;` |
| Headings | `#0A0A0A` | `color: #0A0A0A;` |
| Body text | `#4A4A4A` | `color: #4A4A4A;` |
| Background | `#FFFFFF` | `background: #FFFFFF;` |
| Headline font | DM Serif Display | `font-family: 'DM Serif Display', serif;` |
| Body font | System sans-serif | `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;` |
| Page size | A4 | `@page { size: A4; margin: 20mm; }` |

## Google Fonts CDN

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap" rel="stylesheet">
```

Must be included in the `<head>` of the master template. Puppeteer will fetch and embed the font during PDF rendering.

## Template Partials

### 1. Cover Page (`cover.html`)

**Data required**:
- `blueprint.niche.selectedNiche.name` — Document title
- `generationDate` — Formatted date string

**Layout**:
- Centered vertically and horizontally
- Discovery Engine logo at top (SVG or PNG, max 120px width)
- Main title: niche name in DM Serif Display, 32px, #0A0A0A
- Subtitle: "Your Coaching Blueprint" in sans-serif, 14px, #4A4A4A
- Horizontal accent line in #F05A28
- Generation date at bottom

### 2. Audience Persona (`persona.html`)

**Data required**:
- `blueprint.audience.persona`

**Layout**:
- Page heading: "Your Ideal Audience" in DM Serif Display, 24px
- Demographics card: age, role, location, situation, platforms, paying capacity
- Pain Points section: bullet list
- Desires section: biggest desire + goals
- Optional pull quote in italic with orange left border

### 3. Program Details (`program.html`)

**Data required**:
- `blueprint.program.selectedName`
- `blueprint.program.pricing`

**Layout**:
- Page heading: "Your Signature Program" in DM Serif Display, 24px
- Program name highlight: 28px, DM Serif Display, #F05A28
- Description paragraph
- Pricing strategy card: starting price, sweet spot range, price justification
- Pricing evolution table: launch → 10 students → premium tier

### 4. 12-Week Roadmap (`roadmap.html`)

**Data required**:
- `blueprint.roadmap.phases` — array of RoadmapPhase

**Layout**:
- Page heading: "Your 12-Week Launch Roadmap" in DM Serif Display, 24px
- Phase groupings with colored left borders (mapped from `phase.color` to brand-safe palette)
- Each week: week number badge, milestone title, deliverable list
- Must fit within A4 page boundaries; overflow to next page if needed

### 5. Next Steps (`next-steps.html`)

**Data required**: None (static content with blueprint context)

**Layout**:
- Page heading: "Your Next Steps" in DM Serif Display, 24px
- Numbered action items (5–7 steps):
  1. Review your blueprint and share with a mentor
  2. Set your program launch date
  3. Create your first piece of content for your audience
  4. Set up your coaching platform and payment system
  5. Begin Week 1 of your roadmap
- CTA footer: "Ready to launch? Visit discoveryengine.app"
- Orange accent bar at bottom

## Template Engine Interface

```typescript
interface TemplateEngine {
  compile(blueprint: Blueprint): string;
}

// compile() reads all partials, replaces {{placeholder}} tokens,
// and returns a complete HTML string ready for Puppeteer.
```

## Placeholder Tokens

All partials use `{{camelCase}}` tokens that map to Blueprint JSON paths:

| Token | Source Path |
|---|---|
| `{{nicheName}}` | `blueprint.niche.selectedNiche.name` |
| `{{generationDate}}` | `new Date().toLocaleDateString()` |
| `{{personaName}}` | `blueprint.audience.persona.name` |
| `{{personaAgeRange}}` | `blueprint.audience.persona.ageRange` |
| `{{personaRole}}` | `blueprint.audience.persona.role` |
| `{{personaLocation}}` | `blueprint.audience.persona.location` |
| `{{personaCurrentSituation}}` | `blueprint.audience.persona.currentSituation` |
| `{{personaPayingCapacity}}` | `blueprint.audience.persona.payingCapacity` |
| `{{personaBiggestDesire}}` | `blueprint.audience.persona.biggestDesire` |
| `{{personaQuote}}` | `blueprint.audience.persona.quote` |
| `{{programName}}` | `blueprint.program.selectedName.name` |
| `{{programDescription}}` | `blueprint.program.selectedName.description` |
| `{{startingPrice}}` | `blueprint.program.pricing.startingPrice` |
| `{{sweetSpotRange}}` | `blueprint.program.pricing.sweetSpotRange` |
| `{{priceJustification}}` | `blueprint.program.pricing.priceJustification` |
| `{{marketInsight}}` | `blueprint.program.pricing.marketInsight` |
| `{{roadmapPhases}}` | Iteration over `blueprint.roadmap.phases` |

Array tokens (painPoints, goals, onlinePlatforms, roadmap items) are rendered as HTML lists inside the template engine.
