# SpectaSnap Sprint Status

**Current:** Continue Build — Auth + Data + Tokens ✅ Complete
**Last Updated:** 2026-03-22
**Live URL:** https://spectasnap-orpin.vercel.app
**Branch:** `claude/continue-build` — PR open against `main`

---

## Clean Build Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Core AR Experience (/trydemo) | ✅ Complete — PR #15 |
| Sprint 2 | Store Owner Tools (/dashboard + AI Stylist) | ✅ Complete — PR #16 |
| Sprint 3 | Landing Page & Share | ✅ Complete — PR #17 |
| Sprint 4 | Catalog, QR, Error Handling | ✅ Complete — PR #17 |
| Sprint 5 | Session Tracking & Sales Files | ✅ Complete — PR #17 |
| Final | Auth Screens & Onboarding | ✅ Complete — PR #17 |
| Continue | Auth Wiring + Real Data + Tokens | ✅ Complete — PR open |

---

## Sprint 1 ✅ — Core AR Experience
**Commit:** 7b81ed2 | **PR:** #15 (merged to main)

- [x] Design tokens: cream/ink/gold Tailwind tokens
- [x] Font: Inter (body) + Cormorant Garamond (display)
- [x] `/trydemo` idle screen (dark, serif logo, pulsing ring)
- [x] `/trydemo` active layout (camera + sidebar + frame bar)
- [x] MobileBottomSheet — 3 snap heights (P0 fix)
- [x] Global layout shell (Sidebar + TopBar + BottomNav)
- [x] UI primitives (Button, Input, Badge, Toast)
- [x] Stub pages: /frames, /pricing, /auth/*
- [x] AR engine: BASE_SCALE_FACTOR 0.85, lens opacity 0.22, EMA 0.65

---

## Sprint 2 ✅ — Store Owner Tools
**Commit:** 3f6ba22 | **PR:** #16

- [x] `/dashboard` page: OTP PIN gate (4 boxes), Sidebar+TopBar shell
- [x] 4 stat cards (Cormorant text-5xl), animated face shape bars
- [x] Top frames table + recent sessions table (8 rows)
- [x] "Go Live" → /trydemo (gold CTA)
- [x] `AIStylePanel.tsx`: 5 questions, 3 rec cards, 1500ms min loading
- [x] `/api/stylist`: Claude Sonnet 4, 3-rec JSON array, silent fallback
- [x] `ProductCard.tsx`: "✦ Get AI Recommendation" trigger wired

---

## Sprint 3 🚧 — Landing Page & Share
**Branch:** `claude/overnight-build`

- [x] `LandingV2.tsx`: Full landing redesign (cream/ink/gold, 9 sections)
- [x] `ShareModal.tsx`: Canvas watermark compositing ("SpectaSnap" italic serif, rgba 0.88, bottom-right)
- [x] `/pricing` page: 3-plan cards, monthly/annual toggle, enterprise banner, FAQ

---

## Sprint 4 🚧 — Catalog & Tools
**Branch:** `claude/overnight-build`

- [x] `/qr` page: Rebuilt with new tokens + Sidebar/TopBar/BottomNav, copy URL, step guide
- [x] `/frames` catalog: Full grid (12 frames), search, 6 filter pills, sort dropdown
- [x] `ErrorBoundary.tsx`: Updated to cream/ink/gold tokens
- [x] `MediaPipeLoader.tsx`: AR init overlay, 4 stages (WASM → model → camera → ready)

---

## Sprint 5 🚧 — Session Tracking & Sales
**Branch:** `claude/overnight-build`

- [x] `/api/session` POST: Vercel KV (pre-existing, verified working)
- [x] `/api/stats` GET: Full analytics — shape breakdown, top frames, PD, conversion rate
- [x] `DEMO_SCRIPT.md`: Sales demo script for store owner pitches
- [x] `WHATSAPP_TEMPLATES.md`: 8 WhatsApp templates (cold → referral)
- [x] `DEPLOYMENT_RUNBOOK.md`: Full deployment + env vars + checklist

---

## Continue Build ✅ — Auth Wiring + Real Data + Tokens
**Branch:** `claude/continue-build`

- [x] Diamond → Oblong fix (6 files, 0 Diamond refs remain)
- [x] Dashboard: real `/api/stats` data + 30s auto-refresh + skeleton/error/empty states
- [x] Supabase auth infrastructure (`supabase.ts`, `supabase-server.ts`, `middleware.ts`)
- [x] Auth forms fully wired: login, signup, reset-password, new-password
- [x] TrialBanner component (3 states: early/late/ended)
- [x] PaywallModal component (isOpen gate, gold CTA, ghost link)
- [x] TopBar updated: `showTrial` + `trialDaysLeft` props → renders TrialBanner
- [x] Route protection: admin → 404, protected → login redirect, auth + user → dashboard redirect
- [x] Design tokens: CSS vars in `:root` globals.css
- [x] Inter font via `next/font/google` (no `<link>` tags, DM Sans removed)
- [x] `yarn tsc --noEmit` → 0 errors
- [x] `yarn build` → 0 errors, 27 routes

---

## Final ✅ — Auth Screens & Onboarding
**Branch:** `claude/overnight-build` (PR #17)

- [x] `/auth/login`: Two-column (dark panel + form), email + password
- [x] `/auth/signup`: Two-column, all fields + terms checkbox
- [x] `/auth/verify`: Centered, resend email button
- [x] `/auth/reset-password`: Centered, send reset link, success state
- [x] `/auth/new-password`: Centered, password match validation
- [x] `/onboarding`: 3-step flow (setup → configure → go live), progress dots

---

## CEO Actions Required

### 0. Supabase Project → Full Auth goes live
```
1. Go to https://supabase.com → New Project
2. Add env vars to Vercel:
   NEXT_PUBLIC_SUPABASE_URL = https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
3. Enable Google OAuth in Supabase → Auth → Providers → Google
4. Set redirect URL to: https://spectasnap-orpin.vercel.app/auth/callback
5. Run: vercel --prod
```

### 1. ANTHROPIC_API_KEY → AI Stylist goes live
```
vercel.com → spectasnap → Settings → Environment Variables
Add: ANTHROPIC_API_KEY = sk-ant-...
Run: vercel --prod
```

### 2. Vercel KV → Real session analytics
```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```

### 3. Merge PR and deploy
```bash
# After PR approved:
vercel --prod
```

---

## Post-Deploy Verification Checklist
```
□ yarn tsc --noEmit → zero errors
□ yarn build → zero errors
□ / — Landing page loads (new LandingV2 design)
□ /trydemo — AR try-on works, idle screen correct
□ /dashboard — PIN gate works (1234), stats render
□ AI Stylist — 5-question quiz → 3 recs
□ /frames — Catalog grid, filters, search working
□ /qr — QR generates, downloads, copy URL works
□ /onepager — Printable page loads
□ /pricing — 3 plans + toggle + FAQ
□ /auth/login — Form loads, two-column on desktop
□ /auth/signup — All fields, terms checkbox
□ /onboarding — 3-step flow completes
□ Share → Download → watermark visible on saved image
□ MobileBottomSheet — 3 snaps on mobile (375px)
□ MediaPipeLoader — shows during AR init
□ No hardcoded brand-* tokens in new components
```
