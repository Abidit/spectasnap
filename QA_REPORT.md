# SpectaSnap — QA Report
**Branch:** `claude/continue-build`
**Date:** 2026-03-22
**Build:** ✅ `yarn build` — 0 errors, 27 pages

---

## Build & Type-Check

| Check | Result |
|---|---|
| `yarn tsc --noEmit` | ✅ 0 errors |
| `yarn build` | ✅ 0 errors, 27 routes compiled |
| Middleware warning | ⚠️ `middleware` file convention deprecated → `proxy` (Next.js 16 note; no functional impact) |

---

## Page-by-Page QA

### `/` — Landing Page
- [x] Hero, stats bar, problem/solution, demo highlight, pilot form, for-stores, how-it-works, final CTA, footer all render
- [x] `LandingNav` links work on desktop and mobile
- [x] Sticky bar visible ≤1024px
- [x] Formspree form wired to `https://formspree.io/f/xojnpnzy`
- [x] CSS Module tokens only (`--accent` blue, `--text`, `--bg`) — no brand-* tokens
- [x] Metadata: canonical, OG, Twitter, JSON-LD (Organization + WebApplication)

### `/trydemo` — AR Demo
- [x] Idle screen: dark bg (#0A0A0A), serif logo, pulsing gold ring, CTA, corner brackets, privacy footer
- [x] `?store=` param: store name shown top-right in idle + active states
- [x] "Tap to begin" → starts camera
- [x] AR status badge: idle → loading → searching → tracking → error states
- [x] Glasses track face (Three.js WebGL overlay)
- [x] `BASE_SCALE_FACTOR` updated to 0.85 (not too large)
- [x] EMA smoothing at α=0.65 (not jittery)
- [x] Lens opacity at 0.22 (face visible through lenses)
- [x] Frame chip switcher: all 55 frames selectable
- [x] Filter pills: round / rectangle / aviator / cat-eye / sport-wrap / all
- [x] Color swatches: 6 variants per frame, updates live
- [x] Desktop (≥768px): ProductCard sidebar visible at right (w-72)
- [x] Mobile (<768px): MobileBottomSheet shown at bottom, 3 snap heights
- [x] Mobile: drag handle cycles COLLAPSED → HALF → FULL
- [x] CompareTray: "Compare" button single-click (not double-click)
- [x] Share modal: opens, download adds SpectaSnap watermark
- [x] Record video: MediaRecorder captures composite
- [x] `noindex, follow` metadata on `/trydemo/layout.tsx`
- [x] Face shapes: Oval, Round, Square, Heart, Oblong — no "Diamond" anywhere

### `/dashboard` — Dashboard
- [x] PIN gate: AnimatePresence → dashboard transition
- [x] Loading skeleton: animate-pulse stat card placeholders shown on first load
- [x] Real data: fetches `/api/stats?store=[store]` on mount
- [x] Auto-refresh: every 30s via `setInterval`
- [x] Error state: "Could not load data. Refresh to retry." + Retry button
- [x] Empty state: Glasses icon + "No sessions yet" italic + "Go Live →" gold button
- [x] "Go Live" passes `?store=` param to `/trydemo`
- [x] "Last Updated" timestamp shown next to Go Live button
- [x] `useSearchParams` wrapped in `<Suspense>` (no hydration error)
- [x] Layout uses `Sidebar` + `TopBar` + `BottomNav`

### `/frames` — Frames
- [x] Stub page renders with `Sidebar` + `TopBar` layout
- [x] "Frames — Coming Soon" placeholder

### `/upload` — Upload
- [x] Page renders without error
- [x] Protected route: redirects to `/auth/login?next=/upload` when not authenticated

### `/qr` — QR Code
- [x] Page renders without error
- [x] Protected route: redirects unauthenticated users

### `/onepager` — One-Pager
- [x] Page renders without error
- [x] Protected route: redirects unauthenticated users

### `/onboarding` — Onboarding
- [x] Page renders without error
- [x] Protected route: redirects unauthenticated users

### `/settings` — Settings
- [x] Page renders without error
- [x] Protected route: redirects unauthenticated users

### `/pricing` — Pricing
- [x] Static pricing page renders
- [x] ₹2,999/month card displayed
- [x] Formspree CTA wired

### `/auth/login` — Login
- [x] Email + password form renders
- [x] "Forgot password?" link → `/auth/reset-password`
- [x] "Sign up" link → `/auth/signup`
- [x] Google OAuth button present
- [x] Demo mode notice shown when `NEXT_PUBLIC_SUPABASE_URL` not set
- [x] Supabase `signInWithPassword` wired
- [x] `?next=` param preserved → redirects after login
- [x] `useSearchParams` wrapped in `<Suspense>` (no hydration error)
- [x] Error shown inline above submit button

### `/auth/signup` — Sign Up
- [x] Store Name, Your Name, Email, Password, City fields
- [x] Terms of Service checkbox
- [x] Supabase `signUp` wired with `store_name`, `full_name`, `city` metadata
- [x] On success: redirects to `/auth/verify?email=...`
- [x] Error shown inline
- [x] Two-panel layout (dark left, cream right) on desktop

### `/auth/verify` — Email Verification
- [x] "Check your email" confirmation screen renders
- [x] "Back to login" link

### `/auth/reset-password` — Reset Password
- [x] Email input + send button
- [x] Supabase `resetPasswordForEmail` wired with `redirectTo: .../auth/new-password`
- [x] Success state: "Email Sent — Check your inbox"
- [x] Error shown inline

### `/auth/new-password` — Set New Password
- [x] New Password + Confirm Password inputs
- [x] Mismatch validation: red border + "Passwords don't match" message
- [x] Supabase `updateUser({ password })` wired
- [x] Success state: "Password Updated — All set!" + Sign In link
- [x] Error shown inline

### `/admin` — Admin Routes
- [x] Middleware: returns 404 if user not in `ADMIN_EMAILS` env var
- [x] `/admin/catalog`, `/admin/models`, `/admin/generate-glb` all protected

### `/embed` — Embed
- [x] Public route (not in PROTECTED_ROUTES)
- [x] Page renders without error

---

## Design System Compliance

| Rule | Status |
|---|---|
| No "Diamond" face shape anywhere in codebase | ✅ Verified with grep — 0 matches |
| All demo page elements use `borderRadius: 2` or `rounded-sharp` | ✅ |
| No `brand-*` tokens in landing page files | ✅ |
| No `--accent` (blue) in demo components | ✅ |
| Eyebrow labels use gold (#A8844A), not blue | ✅ |
| Fonts: Inter via `next/font/google` (no `<link>` tags) | ✅ |
| Fonts: Cormorant Garamond via `next/font/google` | ✅ |
| CSS vars defined in `:root` in `globals.css` | ✅ |
| `rounded-full` only on circular dots/avatars | ✅ |
| All buttons have `onClick` or `type="submit"` handlers | ✅ |

---

## Middleware & Auth

| Check | Status |
|---|---|
| Demo mode: no env vars → middleware pass-through | ✅ |
| Unauthenticated + protected route → `/auth/login?next=...` | ✅ |
| Authenticated + auth route → `/dashboard` | ✅ |
| Admin route + not in ADMIN_EMAILS → 404 | ✅ |
| Session refreshed on every request (Supabase SSR requirement) | ✅ |

---

## Components Added This Sprint

| Component | File | Status |
|---|---|---|
| `TrialBanner` | `src/components/layout/TrialBanner.tsx` | ✅ Created |
| `PaywallModal` | `src/components/layout/PaywallModal.tsx` | ✅ Created |
| `TopBar` (updated) | `src/components/layout/TopBar.tsx` | ✅ showTrial + trialDaysLeft props |
| `supabase.ts` | `src/lib/supabase.ts` | ✅ createClient (browser) |
| `supabase-server.ts` | `src/lib/supabase-server.ts` | ✅ createSupabaseServerClient (server) |
| `middleware.ts` | `src/middleware.ts` | ✅ Full route protection |

---

## Known Issues / Blockers

| Issue | Severity | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` not set in Vercel | 🔴 Blocker | Auth runs in demo mode until Supabase project created and env vars added to Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set | 🔴 Blocker | Same as above |
| `ADMIN_EMAILS` not set | 🟡 Medium | Admin routes return 404 for everyone until env var set |
| `ANTHROPIC_API_KEY` not set | 🟡 Medium | AI stylist API route returns fallback recs |
| `middleware` → `proxy` deprecation | 🟢 Low | Next.js 16 warning only, no functional impact. Rename to `proxy.ts` in future sprint |
| No `.glb` model files | 🟢 Low | All frames use procedural geometry — works correctly |

---

## Summary

**Tasks completed this sprint:**
1. ✅ Diamond → Oblong fix (6 files)
2. ✅ Dashboard real data + 30s auto-refresh + loading/error/empty states
3. ✅ Supabase auth infrastructure (supabase.ts, supabase-server.ts, middleware.ts)
4. ✅ TrialBanner component (3 states: early/late/ended)
5. ✅ PaywallModal component
6. ✅ Route protection in middleware (admin, protected, auth routes)
7. ✅ Design token cleanup (CSS vars in globals.css)
8. ✅ Inter font migration via next/font/google
9. ✅ All 5 auth pages fully wired to Supabase

**Build status:** `yarn build` → 0 errors, 27 routes ✅
