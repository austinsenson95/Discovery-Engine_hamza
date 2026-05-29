# Quickstart: Price Adjuster and Course Duration Selector

**Feature**: 006-price-adjuster-duration

## Prerequisites

- Backend dev server running: `cd discovery-engine-backend && npm run dev` (port 3001)
- Frontend dev server running: `cd app && npm run dev` (port 3000)

## Development Workflow

### 1. Start both servers

```bash
# Terminal 1
cd discovery-engine-backend && npm run dev

# Terminal 2
cd app && npm run dev
```

### 2. Test Price Adjuster

1. Open `http://localhost:3000/blueprint`
2. Complete Niche Discovery and Audience Mapping
3. Select problems and choose a program name
4. On the Pricing step (subStep 3):
   - Verify the AI-recommended price is displayed
   - Drag the slider up and down
   - Verify revenue projection cards update in real time
   - Click "Reset to AI Recommendation" and verify it returns to original
5. Click "Build Course Curriculum" and verify the adjusted price persists

### 3. Test Course Duration Selector

1. On the Curriculum step (subStep 4):
   - Verify the duration selector shows 3 options: 4 Weeks, 8 Weeks, 12 Weeks
   - Select "4 Weeks (Intensive)"
   - Click "Generate Curriculum"
   - Verify curriculum has 3-4 modules
2. Select "12 Weeks (Comprehensive)"
   - Regenerate curriculum
   - Verify curriculum has 8+ modules
3. Proceed to Roadmap and verify week distribution matches selected duration

### 4. Run type checks

```bash
# Frontend
cd app && npx tsc --noEmit

# Backend
cd discovery-engine-backend && npm run typecheck
```

## Common Issues

| Issue | Cause | Fix |
|---|---|---|
| Slider not visible | shadcn/ui Slider not imported | Check import in Blueprint.tsx |
| Revenue projections don't update | Client-side calculation error | Check `useMemo` or `useEffect` dependency array |
| Duration not persisting | `duration` not included in `updateBlueprint` payload | Verify `handleBuildCurriculum` sends `program.duration` |
| Legacy blueprint crashes | Missing `aiRecommendedPrice` | Add fallback: `aiRecommendedPrice ?? startingPrice` |
