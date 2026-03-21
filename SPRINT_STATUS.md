# SpectaSnap Sprint Status

**Current:** Clean Build — Sprint 1 Complete ✅
**Last Updated:** 2026-03-21
**Live URL:** https://spectasnap-orpin.vercel.app

---

## Clean Build Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Core AR Experience (/trydemo) | ✅ Complete |
| Sprint 2 | Store Owner Tools (/dashboard) | ⏳ Pending |
| Sprint 3 | Distribution (landing + share) | ⏳ Pending |
| Sprint 4 | Polish & Fundraise Prep | ⏳ Pending |

---

## Sprint 1 Checklist

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
- [x] Kalman Q values reduced 50% (smooth tracking equivalent)
- [x] Yaw fade at 0.6 rad (already correct ✓)

### QA (Dev 3)
- [x] yarn tsc --noEmit → 0 errors
- [x] yarn build → 0 errors (26 routes)
- [ ] Full verification checklist pass
- [ ] vercel --prod deploy

---

## Previous Sprint History (archived)
Previous sprints 1–5 complete. Clean build started 2026-03-21.

## CEO — ANTHROPIC_API_KEY (when ready)
1. vercel.com → spectasnap → Settings → Environment Variables
2. Add: ANTHROPIC_API_KEY = sk-ant-...
3. vercel --prod

## CEO — Vercel KV
```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```
