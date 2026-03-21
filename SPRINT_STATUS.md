# SpectaSnap Sprint Status

**Current:** Sprint 2 — Store Owner Tools — In Progress 🚧
**Last Updated:** 2026-03-21
**Live URL:** https://spectasnap-orpin.vercel.app

---

## Clean Build Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Core AR Experience (/trydemo) | ✅ Complete |
| Sprint 2 | Store Owner Tools (/dashboard + AI Stylist) | 🚧 In Progress |
| Sprint 3 | Distribution (landing + share) | ⏳ Pending |
| Sprint 4 | Polish & Fundraise Prep | ⏳ Pending |

---

## Sprint 1 Checklist ✅

### UI & Frontend (Dev 1)
- [x] Design tokens: cream/ink/gold Tailwind tokens
- [x] Font: Inter (body) + Cormorant Garamond (display)
- [x] `/trydemo` idle screen (dark, serif logo, pulsing ring)
- [x] `/trydemo` active layout (camera + sidebar + frame bar)
- [x] MobileBottomSheet — 3 snap heights (P0 fix)
- [x] Global layout shell (Sidebar + TopBar + BottomNav)
- [x] UI primitives (Button, Input, Badge, Toast)
- [x] Stub pages: /frames, /pricing, /auth/*

### AR Engine (Dev 2)
- [x] Frame scale × 0.85 (threeScene.ts BASE_SCALE_FACTOR)
- [x] Lens opacity → 0.22 (proceduralGlasses.ts)
- [x] EMA smoother posAlpha/rotAlpha → 0.65
- [x] Yaw fade at 0.6 rad (already correct ✓)

### QA (Dev 3)
- [x] yarn tsc --noEmit → 0 errors
- [x] yarn build → 0 errors (26 routes)
- [ ] Full verification checklist pass
- [ ] vercel --prod deploy

**Commit:** 7b81ed2 | **PR:** #15 (merged)

---

## Sprint 2 Checklist 🚧

### Dev 1 — /dashboard
- [ ] PIN gate: 4 OTP boxes (w-14 h-16), shake + red on wrong PIN
- [ ] Dashboard uses Sidebar + TopBar (global layout shell)
- [ ] 4 stat cards: Cormorant text-5xl, correct mock data
- [ ] Face shape distribution bar chart (Oblong NOT Diamond)
- [ ] Top frames this week table (4 rows + trend %)
- [ ] Recent sessions table (8 rows with hash, shape, frames, duration, time ago)
- [ ] "Go Live" button → /trydemo (gold bg)
- [ ] "Export CSV" ghost button in recent sessions header

### Dev 2 — AI Stylist
- [ ] AIStylePanel.tsx at src/components/ar/ (new 5-question, 3-rec format)
- [ ] Updated /api/stylist route → 3 recommendations JSON array
- [ ] Trigger button wired in src/components/ar/ProductCard.tsx
- [ ] Slide-in panel (absolute, 300ms, z-10 within ProductCard)
- [ ] Progress bar (5 segments, gold fill, transition on each Q)
- [ ] Loading state minimum 1500ms
- [ ] 3 rec cards with stagger animation + confidence badge
- [ ] Tap rec → frame switches + panel closes
- [ ] API failure → hardcoded fallback by faceShape

### Dev 3 — QA
- [ ] yarn tsc --noEmit → 0 errors
- [ ] yarn build → 0 errors
- [ ] All Sprint 2 verification checklist items pass

---

## Previous Sprint History (archived)
Previous sprints 1–5 complete. Clean build started 2026-03-21.

## CEO — ANTHROPIC_API_KEY (required for AI Stylist)
1. vercel.com → spectasnap → Settings → Environment Variables
2. Add: ANTHROPIC_API_KEY = sk-ant-...
3. vercel --prod

## CEO — Vercel KV (required for live dashboard stats)
```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```
