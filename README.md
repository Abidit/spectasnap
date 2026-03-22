# SpectaSnap — The Digital Curator

> Real-time 3D AR glasses try-on for optical stores.
> Premium B2B SaaS for independent and chain retailers.

**Live:** https://spectasnap-orpin.vercel.app
**Repo:** https://github.com/Abidit/spectasnap
**Brand:** The Digital Curator — Premium Optic B2B

---

## What is SpectaSnap

SpectaSnap is a browser-native AR glasses try-on platform for optical stores. Customers see themselves wearing frames live via webcam — no app, no download. Store owners get analytics, staff tools, and AI-powered recommendations.

**Two audiences:**
- **Shoppers** — `/trydemo` AR experience, public, no login required
- **Store owners** — `/dashboard`, `/frames`, `/upload`, `/qr`, `/onepager` — login required

---

## Tech Stack

| Package | Version |
|---|---|
| next | ^16.1.6 |
| react | ^18 |
| react-dom | ^18 |
| typescript | ^5 |
| three | ^0.183.1 |
| @mediapipe/tasks-vision | 0.10.14 |
| @supabase/supabase-js | ^2.99.3 |
| @supabase/ssr | ^0.9.0 |
| @anthropic-ai/sdk | ^0.80.0 |
| @imgly/background-removal | ^1.7.0 |
| onnxruntime-web | 1.21.0 |
| @vercel/kv | ^3.0.0 |
| @vercel/blob | ^2.3.1 |
| @vercel/analytics | ^2.0.1 |
| qrcode | ^1.5.4 |
| framer-motion | ^11.3.0 |
| lucide-react | ^0.400.0 |
| tailwindcss | ^3 |
| kalmanjs | ^1.1.0 |
| clsx | ^2.1.1 |

Fonts loaded via `next/font/google`: **Inter** (body) + **Cormorant Garamond** (display).

---

## Design System

### Colors

```
cream-50:   #FDFAF4   page background
cream-100:  #F5F0E8   panel background
cream-200:  #EDE8DC   chip/tag backgrounds
cream-400:  #DDD8CE   borders, dividers
ink-900:    #1A1612   primary text
ink-500:    #6B6560   secondary text
ink-300:    #9A9490   muted text, icons
gold-500:   #C9A96E   primary accent — selected states, CTAs
gold-600:   #A8844A   darker gold — hover, active
gold-100:   #F7EDD8   light gold tint
dark:       #0A0A0A   camera viewport background
```

### Typography

- **Display / frame names** — `font-serif` (Cormorant Garamond), 18–24px, semibold
- **UI labels, tags, buttons** — `font-sans` (Inter), 9–11px, semibold, uppercase, wide tracking
- **Body copy** — `font-sans`, 13–14px, normal weight

### Border Radius

```
rounded-sharp = 2px   everywhere in demo/store pages — no exceptions
rounded-full          pills and circular swatches/dots only
```

> **Rule:** Every button, input, card, and chip in the store owner UI uses `borderRadius: 2` (`rounded-sharp`). Never use `rounded-md`, `rounded-lg`, or `rounded-xl` in demo context.

### Two Styling Contexts

SpectaSnap has two separate token sets. Never mix them.

| Context | Files | Tokens |
|---|---|---|
| Store owner / demo | `src/app/globals.css`, all `tailwind.config.ts` tokens | cream/ink/gold |
| Landing page | `src/app/landing.module.css` | CSS custom properties, blue accent `#2563EB` |

---

## Project Structure

```
spectasnap/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout — fonts, metadata, Analytics
│   │   ├── globals.css                 # Tailwind base + CSS vars + print styles
│   │   ├── page.tsx                    # Landing page (Server Component, SEO)
│   │   ├── LandingClient.tsx           # Landing content (server component)
│   │   ├── LandingV2.tsx               # Updated landing (cream/gold design)
│   │   ├── PilotForm.tsx               # B2B pilot lead capture — Formspree
│   │   ├── landing.module.css          # Landing CSS Modules
│   │   ├── landing2.module.css         # V2 landing styles
│   │   ├── trydemo/
│   │   │   ├── layout.tsx              # noindex, canonical
│   │   │   └── page.tsx                # AR try-on page ('use client')
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # Store analytics — stats, top frames, sessions
│   │   ├── frames/
│   │   │   └── page.tsx                # Frame catalog — search, filter, sort
│   │   ├── upload/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # 4-step upload wizard — bg removal, calibration
│   │   ├── qr/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # QR code generator — PNG/SVG/print
│   │   ├── onepager/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # Printable A4 sales one-pager
│   │   ├── pricing/
│   │   │   └── page.tsx                # Starter / Pro / Business plans
│   │   ├── onboarding/
│   │   │   └── page.tsx                # 3-step store setup: Identity → PIN → Launch
│   │   ├── embed/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                # Embeddable iframe (no chrome)
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Two-column Supabase login
│   │   │   ├── signup/page.tsx         # Two-column signup + terms
│   │   │   ├── verify/page.tsx         # Email verification prompt
│   │   │   ├── reset-password/page.tsx # Send reset link
│   │   │   └── new-password/page.tsx   # Set new password → auto-redirect
│   │   ├── admin/
│   │   │   ├── layout.tsx              # ADMIN_EMAILS gate → 404
│   │   │   ├── page.tsx
│   │   │   ├── catalog/page.tsx
│   │   │   ├── models/page.tsx
│   │   │   └── generate-glb/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── session/route.ts        # POST — log session to Vercel KV
│   │       ├── stats/route.ts          # GET — analytics aggregate
│   │       ├── stylist/route.ts        # POST — Claude AI recommendations
│   │       ├── catalog/route.ts        # GET/POST — frame catalog CRUD
│   │       ├── store/route.ts          # GET/PATCH — store settings
│   │       └── upload-glb/route.ts     # POST — GLB to Vercel Blob
│   │
│   ├── ar/                             # AR engine
│   │   ├── pose.ts                     # 6DOF face tracking + EMA smoother
│   │   ├── threeScene.ts               # Three.js singleton — renderer, scene, models
│   │   ├── proceduralGlasses.ts        # Frame geometry generated at runtime
│   │   ├── proceduralTemples.ts        # Temple arm geometry
│   │   ├── presets.ts                  # 50 frame presets + 6 color variants
│   │   ├── occluder.ts                 # Face mesh occluder (depth masking)
│   │   ├── triangulation.ts            # MediaPipe 478-pt triangle indices
│   │   ├── customFrameLoader.ts        # GLB loader for uploaded frames
│   │   ├── glassesDetector.ts          # Style detection utilities
│   │   ├── glbCalibrate.ts             # GLB calibration helpers
│   │   ├── glbTempleAnimate.ts         # Temple animation for GLB models
│   │   ├── glbTempleDetect.ts          # Temple bone detection in GLB
│   │   ├── inpaint.ts                  # Frame image inpainting
│   │   ├── pdMeasure.ts                # Pupillary distance measurement
│   │   ├── pdOverlay.ts                # PD canvas overlay
│   │   ├── photochromic.ts             # Photochromic lens simulation
│   │   └── recorder.ts                 # AR session recording
│   │
│   ├── components/
│   │   ├── ar/                         # AR demo components
│   │   │   ├── ARCamera.tsx            # Camera + MediaPipe render loop
│   │   │   ├── ThreeOverlay.tsx        # React wrapper for threeScene.ts
│   │   │   ├── GlassesGrid.tsx         # Horizontal frame picker + filter bar
│   │   │   ├── ProductCard.tsx         # Desktop sidebar — details, swatches, AI
│   │   │   ├── MobileBottomSheet.tsx   # 3-snap sheet (72px / 300px / 85vh)
│   │   │   ├── AIStylePanel.tsx        # 5-question quiz → 3 AI recs
│   │   │   ├── ARStatusBadge.tsx       # idle/loading/tracking/error badge
│   │   │   ├── ShareModal.tsx          # Canvas watermark + download/share
│   │   │   ├── CompareTray.tsx         # Side-by-side frame comparison
│   │   │   └── MediaPipeLoader.tsx     # AR init overlay (4 stages)
│   │   ├── layout/                     # Shell components
│   │   │   ├── Sidebar.tsx             # Icon sidebar — logo + nav groups
│   │   │   ├── TopBar.tsx              # 56px sticky header
│   │   │   ├── BottomNav.tsx           # Mobile bottom nav
│   │   │   ├── TrialBanner.tsx         # Trial status (early / late / ended)
│   │   │   └── PaywallModal.tsx        # Upgrade gate modal
│   │   ├── frames/
│   │   │   └── FramePreview.tsx        # Canvas frame schematic preview
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/
│   │   ├── glasses-data.ts             # GLASSES_COLLECTION — 55 frames (source of truth)
│   │   ├── supabase.ts                 # Supabase browser client
│   │   ├── supabase-server.ts          # Supabase server client (SSR/API)
│   │   ├── removeBackground.ts         # @imgly/background-removal wrapper
│   │   ├── suitability.ts              # Face shape → frame suitability scoring
│   │   ├── embedApi.ts                 # Embed SDK utilities
│   │   └── face-overlay.ts             # 2D canvas fallback (legacy)
│   │
│   └── middleware.ts                   # Route protection + Supabase session refresh
│
├── public/
│   ├── models/models.json              # Frame registry: frameId → type/presetId/scale
│   ├── embed.js                        # Embeddable widget script
│   ├── favicon.svg
│   ├── og-image.svg                    # 1200×630 OG social card
│   ├── robots.txt
│   └── sitemap.xml
│
├── tailwind.config.ts
├── next.config.ts                      # COOP/COEP headers (required for WASM threading)
├── CLAUDE.md                           # AI agent instructions + design system contracts
├── SPRINT_STATUS.md
├── REDESIGN_REPORT.md
└── DEPLOYMENT_RUNBOOK.md
```

---

## Pages & Routes

| Route | Auth | Description |
|---|---|---|
| `/` | No | Landing page — hero, features, B2B pilot form |
| `/trydemo` | No | AR try-on (main consumer product) — noindex |
| `/embed` | No | Embeddable iframe, no chrome |
| `/pricing` | No | Starter / Professional / Business plans |
| `/dashboard` | Yes | Store analytics — sessions, frames, face shapes |
| `/frames` | Yes | Frame catalog — search, filter, sort |
| `/upload` | Yes | 4-step upload wizard |
| `/qr` | Yes | QR code generator |
| `/onepager` | Yes | Printable sales one-pager |
| `/onboarding` | Yes | 3-step store setup wizard |
| `/auth/login` | No | Supabase email/password login |
| `/auth/signup` | No | New account registration |
| `/auth/verify` | No | Email verification |
| `/auth/reset-password` | No | Send reset email |
| `/auth/new-password` | No | Set new password |
| `/admin/*` | Admin only | Catalog + model management (ADMIN_EMAILS whitelist) |
| `/api/session` | — | POST — log try-on session |
| `/api/stats` | — | GET — analytics aggregate |
| `/api/stylist` | — | POST — Claude AI recommendations |
| `/api/catalog` | — | GET/POST — frame catalog |
| `/api/store` | — | GET/PATCH — store settings |
| `/api/upload-glb` | — | POST — GLB to Vercel Blob |

**Middleware rules:**
- Protected routes → redirect to `/auth/login?next=<path>` if unauthenticated
- `/admin/*` → 404 if email not in `ADMIN_EMAILS`
- `/auth/*` → redirect to `/dashboard` if already logged in
- `NEXT_PUBLIC_SUPABASE_URL` unset → **demo mode**: all routes open, no auth checks

---

## AR Pipeline

```
Webcam
  → MediaPipe FaceLandmarker (478 landmarks, VIDEO mode, 60fps)
  → pose.ts: computeTransform()
      cx, cy   — normalised face centre (eye midpoint)
      ipd      — inter-pupillary distance (pixels)
      roll     — atan2(eye_R.y - eye_L.y, eye_R.x - eye_L.x)
      yaw      — (lp.z - rp.z) × 3.5  (depth asymmetry)
      pitch    — nose z-delta
  → pose.ts: smooth()  — EMA α=0.65 per DOF
  → threeScene.ts: applyFaceTransform()
      positions/rotates Three.js model group
      MODEL_BASE_ROTATION_Z = Math.PI  (180° orientation correction)
  → proceduralGlasses.ts
      TubeGeometry (round/aviator/cat-eye)
      BoxGeometry (rectangle)
      CylinderGeometry (bridge)
      MeshPhysicalMaterial: transmission 0.85, ior 1.5
  → occluder.ts
      478-point face mesh, colorWrite:false, depthWrite:true
      Hides glasses geometry behind ears and nose
  → Three.js WebGL canvas composited over <video>
```

Yaw fade: model opacity → 0 at |yaw| > 0.42 rad. All 55 frames use procedural geometry — no `.glb` files required. Color changes via `updateGlassesColor()` in `proceduralGlasses.ts`.

---

## Components

### `ARCamera` (`src/components/ar/ARCamera.tsx`)
Main AR orchestrator. Initialises MediaPipe, manages camera stream, drives the 60fps loop.
Props: `selectedGlasses`, `selectedColor?`, `onARStatusChange?`.
Always pass `onARStatusChange` to keep `ARStatusBadge` in sync.

### `GlassesGrid` (`src/components/ar/GlassesGrid.tsx`)
Horizontal scrollable frame picker + `FrameFilterBar` (6 tabs).
Props: `selected`, `onSelect`. Filter state is local — do not lift.

### `ProductCard` (`src/components/ar/ProductCard.tsx`)
Desktop right sidebar. Frame name, style, face shape suitability, 6 colour swatches, AI Stylist trigger.
`onAskStaff` is the primary conversion action — always wire it.

### `MobileBottomSheet` (`src/components/ar/MobileBottomSheet.tsx`)
3-snap touch drawer. Collapsed (72px) → half (300px) → full (85vh).
Frame Finish swatches: 28×28px squares, `borderRadius: 2`.
CTAs: "AI CURATOR INSIGHTS" → `onAskStaff`, "PURCHASE · EXPRESS DELIVERY" → `onShareLook`.

### `AIStylePanel` (`src/components/ar/AIStylePanel.tsx`)
5-question quiz → POST `/api/stylist` → 3 AI recommendation cards.
Minimum 1500ms loading animation. Uses Claude Sonnet 4.

### `ARStatusBadge` (`src/components/ar/ARStatusBadge.tsx`)
Status: `idle` (grey) → `loading` (gold pulse) → `searching` → `tracking` (gold + "AR Live") → `error` (red).
`aria-live="polite"`. Only status surface in the UI — do not add secondary indicators.

### `MediaPipeLoader` (`src/components/ar/MediaPipeLoader.tsx`)
Full-screen init overlay. 4 stages: WASM → model → camera → ready.

### `ShareModal` (`src/components/ar/ShareModal.tsx`)
Canvas watermark ("SpectaSnap" italic serif, rgba 0.88, bottom-right) + PNG download / Web Share API.

### `Sidebar` (`src/components/layout/Sidebar.tsx`)
Icon sidebar, 64px wide. Logo + "DIGITAL CURATOR" subtitle.
Top nav: Try-On, Dashboard, Frames, Upload, QR Code, One-Pager.
Bottom nav: Settings only.

### `TopBar` (`src/components/layout/TopBar.tsx`)
Sticky 56px header. Logo left, italic serif page title center, store name pill right.
Props: `pageTitle?`, `storeName?`, `showTrial?`, `trialDaysLeft?`.

### `TrialBanner` (`src/components/layout/TrialBanner.tsx`)
Trial status — 3 states: early (>7 days), late (≤7 days, urgent), ended (upgrade CTA).

### `PaywallModal` (`src/components/layout/PaywallModal.tsx`)
Full-screen upgrade gate. Gold primary CTA, ghost dismiss link.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth | Supabase anon key |
| `ANTHROPIC_API_KEY` | For AI Stylist | Claude Sonnet 4 key |
| `KV_URL` | For analytics | Vercel KV connection string |
| `KV_REST_API_URL` | For analytics | Vercel KV REST URL |
| `KV_REST_API_TOKEN` | For analytics | Vercel KV token |
| `KV_REST_API_READ_ONLY_TOKEN` | Optional | Read-only KV access |
| `BLOB_READ_WRITE_TOKEN` | For GLB uploads | Vercel Blob token |
| `ADMIN_EMAILS` | For admin routes | Comma-separated admin email list |

Without `NEXT_PUBLIC_SUPABASE_URL` → demo mode, all routes accessible without login. Without `ANTHROPIC_API_KEY` → AI Stylist shows a graceful error, rest of app unaffected.

---

## Getting Started

```bash
yarn install

# copy and fill in env vars
cp .env.example .env.local

yarn dev          # http://localhost:3000
yarn tsc --noEmit # type-check
yarn lint         # ESLint
yarn format       # Prettier
yarn build        # production build
```

MediaPipe WASM loads from `cdn.jsdelivr.net` at runtime — internet required in dev.

`reactStrictMode: false` is intentional — prevents double MediaPipe init in dev mode.
`ARCamera` uses `dynamic(() => import(...), { ssr: false })` — do not remove `ssr: false`.

---

## Deploy

```bash
vercel --prod
```

Auto-deploys on push to `main`. `vercel.json` sets COOP/COEP headers required for SharedArrayBuffer (MediaPipe WASM threading).

Set up Vercel KV once:
```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```

Full deploy instructions, DNS setup, rollback procedure, and post-deploy checklist: see `DEPLOYMENT_RUNBOOK.md`.

---

## Current Status

| Feature | Status | Notes |
|---|---|---|
| AR try-on (/trydemo) | ✅ Live | 55 frames, 6 colour variants, mobile + desktop |
| Dashboard analytics | ✅ Live | Real Vercel KV data, 30s auto-refresh |
| AI Stylist | ✅ Live | Requires `ANTHROPIC_API_KEY` |
| Supabase auth | ✅ Live | Demo mode if env vars unset |
| Frame catalog (/frames) | ✅ Live | 9 styles, search, filter, sort |
| Upload wizard (/upload) | ✅ Live | 4 steps, bg removal, GLB calibration |
| QR generator (/qr) | ✅ Live | PNG/SVG download, print |
| Sales one-pager (/onepager) | ✅ Live | Browser print → PDF |
| Pricing page | ✅ Live | 3 plans, monthly/annual toggle |
| Onboarding wizard | ✅ Live | 3 steps |
| Frame comparison | ✅ Live | CompareTray — up to 4 frames |
| Share + watermark | ✅ Live | Canvas compositing, Web Share API |
| Embedded widget | ✅ Live | `/embed` + `public/embed.js` |
| Custom GLB upload | 🚧 Admin only | `/admin/generate-glb` + Vercel Blob |
| PD measurement | 🚧 Built, not surfaced | `src/ar/pdMeasure.ts` |
| Photochromic lenses | 🚧 Built, not surfaced | `src/ar/photochromic.ts` |
| Session recording | 🚧 Built, not surfaced | `src/ar/recorder.ts` |
| Real glasses photos | ❌ Not started | All frames use procedural Three.js geometry |

---

## Sprint History

| Sprint | PR | Status |
|---|---|---|
| Sprint 1 — Core AR Experience | #15 | ✅ Merged |
| Sprint 2 — Store Owner Tools + AI Stylist | #16 | ✅ Merged |
| Sprint 3–5 + Auth — Landing, Catalog, Sessions | #17 | ✅ Merged |
| Continue Build — Auth Wiring + Real Data | #18 | ✅ Merged |
| Figma Redesign Sprint (10 screens) | #20 | ✅ Merged |

See `SPRINT_STATUS.md` for full sprint details and CEO action items.
