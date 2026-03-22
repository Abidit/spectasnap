# SpectaSnap — Real-Time 3D Glasses AR Try-On

**Live URL:** https://spectasnap-orpin.vercel.app
**Demo:** https://spectasnap-orpin.vercel.app/trydemo

Browser-native AR glasses try-on for optical stores. No app install required. Real-time 3D rendering with MediaPipe face tracking at 60fps — customers point their camera and try on frames instantly.

---

## 1. Project Overview

SpectaSnap is a **B2B SaaS platform for optical boutiques** that turns any smartphone or laptop camera into an AR try-on mirror. Store owners embed a QR code on their shelf — customers scan it and immediately try 50+ frames in their browser.

**Brand positioning:** "The Digital Curator" — a luxury optical SaaS tool, warm cream/gold design system, Cormorant Garamond display type.

**Two audiences:**
- **Shoppers** — `/trydemo` AR experience (public, no login)
- **Store owners** — `/dashboard`, `/frames`, `/upload`, `/qr`, `/onepager` (login required)

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.1.6 |
| Language | TypeScript (strict) | ^5 |
| React | React + React DOM | ^18 |
| 3D rendering | Three.js | ^0.183.1 |
| Face tracking | @mediapipe/tasks-vision | 0.10.14 |
| Auth | @supabase/supabase-js + @supabase/ssr | ^2.99.3 / ^0.9.0 |
| AI Stylist | @anthropic-ai/sdk (Claude Sonnet 4) | ^0.80.0 |
| Background removal | @imgly/background-removal + onnxruntime-web | ^1.7.0 / 1.21.0 |
| Session analytics | @vercel/kv | ^3.0.0 |
| File storage | @vercel/blob | ^2.3.1 |
| Analytics | @vercel/analytics | ^2.0.1 |
| QR generation | qrcode | ^1.5.4 |
| Animation | framer-motion | ^11.3.0 |
| Icons | lucide-react | ^0.400.0 |
| Styling | Tailwind CSS + CSS Modules | ^3 |
| Fonts | Inter (body) + Cormorant Garamond (display) | next/font/google |
| Tracking filter | kalmanjs | ^1.1.0 |
| Deployment | Vercel | — |

---

## 3. Project Structure

```
spectasnap/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout — fonts, metadata, Vercel Analytics
│   │   ├── globals.css               # Tailwind base, CSS variables, print styles
│   │   ├── page.tsx                  # Landing page (Server Component, SEO metadata)
│   │   ├── LandingClient.tsx         # Landing page content (server component)
│   │   ├── LandingV2.tsx             # Updated landing with cream/gold design
│   │   ├── PilotForm.tsx             # B2B pilot lead capture (Formspree, 'use client')
│   │   ├── landing.module.css        # Landing page CSS Modules (SaaS blue tokens)
│   │   ├── landing2.module.css       # V2 landing styles
│   │   ├── trydemo/
│   │   │   ├── layout.tsx            # noindex, canonical
│   │   │   └── page.tsx              # AR try-on page ('use client') — main consumer experience
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Store owner dashboard — stats, top frames, sessions
│   │   ├── frames/
│   │   │   └── page.tsx              # Frames catalog — 9 curated styles, search, filter, sort
│   │   ├── upload/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Frame upload wizard — 4 steps, bg removal, calibration
│   │   ├── qr/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # QR code generator — download PNG/SVG, print
│   │   ├── onepager/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Printable sales one-pager for store pitches
│   │   ├── pricing/
│   │   │   └── page.tsx              # Pricing plans — Starter/Pro/Business, monthly/annual
│   │   ├── onboarding/
│   │   │   └── page.tsx              # 3-step store setup wizard (Identity → PIN → Launch)
│   │   ├── embed/
│   │   │   ├── layout.tsx            # Embedded iframe try-on (no chrome)
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # Two-column login — Supabase email/password
│   │   │   ├── signup/page.tsx       # Two-column signup — all fields + terms
│   │   │   ├── verify/page.tsx       # Email verification — resend button
│   │   │   ├── reset-password/page.tsx  # Send reset link
│   │   │   └── new-password/page.tsx # Set new password + auto-redirect to dashboard
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin-only gate (ADMIN_EMAILS env var)
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── catalog/page.tsx      # Catalog management
│   │   │   ├── models/page.tsx       # 3D model registry editor
│   │   │   └── generate-glb/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx          # GLB generation tool
│   │   └── api/
│   │       ├── session/route.ts      # POST — log AR try-on session to Vercel KV
│   │       ├── stats/route.ts        # GET — aggregate analytics (shape breakdown, top frames)
│   │       ├── stylist/route.ts      # POST — Claude Sonnet 4 AI frame recommendations
│   │       ├── catalog/route.ts      # GET/POST — frame catalog management
│   │       ├── store/route.ts        # GET/PATCH — store settings
│   │       └── upload-glb/route.ts   # POST — GLB upload to Vercel Blob
│   │
│   ├── ar/                           # AR engine (Three.js + MediaPipe)
│   │   ├── pose.ts                   # 6DOF face tracking — cx/cy/ipd/roll/yaw/pitch + EMA smoother
│   │   ├── threeScene.ts             # Three.js singleton — renderer, scene, model switching
│   │   ├── proceduralGlasses.ts      # Procedural frame geometry (no GLB files needed)
│   │   ├── proceduralTemples.ts      # Temple arm geometry
│   │   ├── presets.ts                # 50 frame presets + 6 ColorVariant swatches
│   │   ├── occluder.ts               # Face mesh occluder (hides glasses behind ears/nose)
│   │   ├── triangulation.ts          # MediaPipe 478-point triangle indices
│   │   ├── customFrameLoader.ts      # GLB loader for custom uploaded frames
│   │   ├── glassesDetector.ts        # Style detection utilities
│   │   ├── glbCalibrate.ts           # GLB model calibration helpers
│   │   ├── glbTempleAnimate.ts       # Temple arm animation for GLB models
│   │   ├── glbTempleDetect.ts        # Temple bone detection in GLB
│   │   ├── inpaint.ts                # Frame image inpainting utilities
│   │   ├── pdMeasure.ts              # Pupillary distance measurement
│   │   ├── pdOverlay.ts              # PD measurement canvas overlay
│   │   ├── photochromic.ts           # Photochromic lens simulation
│   │   └── recorder.ts               # AR session recording
│   │
│   ├── components/
│   │   ├── ar/                       # AR demo components ('use client')
│   │   │   ├── ARCamera.tsx          # Main AR component — camera stream + MediaPipe loop
│   │   │   ├── ThreeOverlay.tsx      # React wrapper around threeScene.ts
│   │   │   ├── GlassesGrid.tsx       # Horizontal scrollable frame picker + filter bar
│   │   │   ├── ProductCard.tsx       # Desktop sidebar — frame details, AI stylist trigger
│   │   │   ├── MobileBottomSheet.tsx # 3-snap mobile sheet (72px / 300px / 85vh)
│   │   │   ├── AIStylePanel.tsx      # 5-question quiz → 3 AI frame recommendations
│   │   │   ├── ARStatusBadge.tsx     # AR tracking status indicator
│   │   │   ├── ShareModal.tsx        # Canvas watermark compositing + share/download
│   │   │   ├── CompareTray.tsx       # Side-by-side frame comparison
│   │   │   └── MediaPipeLoader.tsx   # AR init overlay (4 stages)
│   │   ├── layout/                   # Shell components
│   │   │   ├── Sidebar.tsx           # Left nav — logo + "DIGITAL CURATOR", top/bottom nav
│   │   │   ├── TopBar.tsx            # Sticky 56px header — logo, title, store pill
│   │   │   ├── BottomNav.tsx         # Mobile bottom navigation
│   │   │   ├── TrialBanner.tsx       # Trial status banner (early/late/ended states)
│   │   │   └── PaywallModal.tsx      # Upgrade gate modal
│   │   ├── frames/
│   │   │   └── FramePreview.tsx      # Canvas-based frame schematic preview
│   │   └── ui/                       # Primitive UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       └── Toast.tsx
│   │
│   ├── lib/
│   │   ├── glasses-data.ts           # GLASSES_COLLECTION — 55 frames (source of truth)
│   │   ├── supabase.ts               # Supabase browser client
│   │   ├── supabase-server.ts        # Supabase server client (Server Components / API routes)
│   │   ├── removeBackground.ts       # @imgly/background-removal wrapper
│   │   ├── suitability.ts            # Face shape → frame suitability scoring
│   │   ├── embedApi.ts               # Embed SDK utilities
│   │   └── face-overlay.ts           # 2D canvas fallback overlay (legacy)
│   │
│   └── middleware.ts                 # Route protection — Supabase session refresh + redirects
│
├── public/
│   ├── models/models.json            # 3D model registry (frameId → type/presetId/scale)
│   ├── embed.js                      # Embeddable widget script
│   ├── favicon.svg                   # SVG favicon
│   ├── og-image.svg                  # OG social card (1200×630)
│   ├── robots.txt
│   └── sitemap.xml                   # Landing page only (trydemo excluded)
│
├── tailwind.config.ts                # Design tokens (cream/ink/gold palette)
├── next.config.ts                    # COOP/COEP headers, turbopack
├── CLAUDE.md                         # AI agent instructions + design system contracts
├── SPRINT_STATUS.md                  # Sprint history and CEO action items
└── REDESIGN_REPORT.md                # Figma redesign implementation notes
```

---

## 4. Pages & Routes

| Route | Auth Required | Description |
|---|---|---|
| `/` | No | Landing page — hero, features, B2B pilot form |
| `/trydemo` | No | AR try-on experience (main consumer product) |
| `/embed` | No | Embeddable iframe version (no shell chrome) |
| `/pricing` | No | Starter / Professional / Business plans |
| `/dashboard` | Yes | Store analytics — sessions, top frames, face shapes |
| `/frames` | Yes | Frame catalog — 9 styles, search, filter, sort |
| `/upload` | Yes | 4-step upload wizard — bg removal + calibration |
| `/qr` | Yes | QR code generator — PNG/SVG download + print |
| `/onepager` | Yes | Printable sales one-pager |
| `/onboarding` | Yes | 3-step store setup wizard |
| `/auth/login` | No | Email + password login |
| `/auth/signup` | No | New account registration |
| `/auth/verify` | No | Email verification prompt |
| `/auth/reset-password` | No | Send password reset email |
| `/auth/new-password` | No | Set new password (from reset link) |
| `/admin` | Admin only | Admin dashboard (ADMIN_EMAILS whitelist) |
| `/admin/catalog` | Admin only | Catalog management |
| `/admin/models` | Admin only | 3D model registry |
| `/admin/generate-glb` | Admin only | GLB generation tool |
| `/api/session` | — | POST — log try-on session (Vercel KV) |
| `/api/stats` | — | GET — aggregate analytics |
| `/api/stylist` | — | POST — AI frame recommendations (Claude) |
| `/api/catalog` | — | GET/POST — frame catalog CRUD |
| `/api/store` | — | GET/PATCH — store settings |
| `/api/upload-glb` | — | POST — upload GLB to Vercel Blob |

**Route protection** (`middleware.ts`):
- `/dashboard`, `/frames`, `/upload`, `/qr`, `/onepager`, `/onboarding`, `/settings` → redirect to `/auth/login?next=<path>` if unauthenticated
- `/admin/*` → 404 if not in `ADMIN_EMAILS`
- `/auth/*` → redirect to `/dashboard` if already logged in
- If `NEXT_PUBLIC_SUPABASE_URL` is unset → **demo mode**: all routes accessible without login

---

## 5. Components

### AR Components (`src/components/ar/`)

**`ARCamera.tsx`** — Main AR orchestrator. Initialises MediaPipe FaceLandmarker, manages webcam stream, drives the 60fps render loop. Props: `selectedGlasses`, `selectedColor?`, `onARStatusChange?`.

**`GlassesGrid.tsx`** — Horizontal scrollable frame picker. Contains `FrameFilterBar` with 6 filter tabs (all / round / rectangle / aviator / cat-eye / sport-wrap). Filter state is local.

**`ProductCard.tsx`** — Desktop right sidebar. Frame details, face shape suitability, 6 colour swatches, AI Stylist trigger.

**`MobileBottomSheet.tsx`** — 3-snap drawer for mobile (collapsed 72px / half 300px / full 85vh). Drag gestures for snap transitions. Frame Finish swatches are 28×28px squares (`borderRadius: 2`).

**`AIStylePanel.tsx`** — 5-question quiz → POST `/api/stylist` → 3 recommendation cards. 1500ms minimum loading animation.

**`ARStatusBadge.tsx`** — AR status indicator: `idle` → `loading` → `searching` → `tracking` → `error`. Uses `aria-live="polite"`.

**`MediaPipeLoader.tsx`** — Full-screen AR init overlay. 4 stages: loading WASM → downloading model → initialising camera → ready.

**`ShareModal.tsx`** — Canvas compositing: "SpectaSnap" watermark + download PNG / Web Share API.

**`CompareTray.tsx`** — Side-by-side frame comparison tray (up to 4 frames).

### Layout Components (`src/components/layout/`)

**`Sidebar.tsx`** — 64px icon sidebar. Logo area with "DIGITAL CURATOR" subtitle. Top nav: Try-On, Dashboard, Frames, Upload, QR Code, One-Pager. Bottom nav: Settings.

**`TopBar.tsx`** — Sticky 56px header. Logo left, page title center (italic serif), store name pill right. Optional `TrialBanner` below.

**`TrialBanner.tsx`** — Trial status: early (>7 days), late (≤7 days), ended (upgrade CTA). Props: `daysLeft`.

**`PaywallModal.tsx`** — Full-screen upgrade gate modal.

---

## 6. AR Pipeline

```
Webcam → MediaPipe FaceLandmarker (478 landmarks, VIDEO mode, 60fps)
  ↓
pose.ts: computeTransform()
  - cx, cy  — normalised face centre (eye midpoint)
  - ipd     — interpupillary distance (pixels)
  - roll    — atan2(eye_R.y - eye_L.y, eye_R.x - eye_L.x)
  - yaw     — (lp.z - rp.z) × 3.5 depth asymmetry
  - pitch   — nose z-delta
  ↓
pose.ts: smooth()  — EMA α=0.65 per degree of freedom
  ↓
threeScene.ts: applyFaceTransform()
  - Positions/rotates Three.js model group
  - MODEL_BASE_ROTATION_Z = Math.PI (orientation correction)
  ↓
proceduralGlasses.ts — generates geometry from presets.ts at runtime
  - Lens: TubeGeometry (round/aviator/cat-eye), BoxGeometry (rectangle)
  - Bridge: CylinderGeometry
  - Material: MeshPhysicalMaterial (transmission:0.85, ior:1.5)
  ↓
occluder.ts — 478-point face mesh (colorWrite:false, depthWrite:true)
  Hides glasses behind ears/nose for realistic depth compositing
  ↓
Three.js WebGL canvas composited over <video> element
```

Key details: Yaw fade at |yaw| > 0.42 rad (extreme profile). Color changes via `updateGlassesColor()` in `proceduralGlasses.ts`. All 55 frames use procedural geometry — `public/models/models.json` maps frame IDs to `presetId`.

---

## 7. Design System

SpectaSnap has two separate styling contexts. Never mix tokens between them.

### Demo / Store owner pages — Tailwind tokens (`tailwind.config.ts`)

```
cream-50:  #FDFAF4   page background
cream-100: #F5F0E8   panel background
cream-200: #EDE8DC   chip/tag backgrounds
cream-400: #DDD8CE   borders, dividers
ink-900:   #1A1612   primary text
ink-500:   #6B6560   secondary text
ink-300:   #9A9490   muted text, icons
gold-500:  #C9A96E   primary accent — selected states, CTAs
gold-600:  #A8844A   darker gold — hover, active
gold-100:  #F7EDD8   light gold tint
dark:      #0A0A0A   camera viewport background
```

- Display / frame names: `font-serif` (Cormorant Garamond), 18–24px
- UI labels/buttons: `font-sans` (Inter), 9–11px, uppercase, wide tracking
- **Border radius: 2px (`rounded-sharp`) everywhere** — no rounded corners except circular dots/swatches

### Landing page — CSS Modules (`landing.module.css`)

```
--bg: #F7F7F5  --text: #111111  --muted: #5C5C5C
--accent: #2563EB (blue)  --radius: 12px  --radius-sm: 8px
```

Typography: Sora (headings) + Inter (body). Form inputs: `border-radius: 2px`.

---

## 8. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth | Supabase anon key |
| `ANTHROPIC_API_KEY` | For AI Stylist | Claude Sonnet 4 API key |
| `KV_URL` | For analytics | Vercel KV connection string |
| `KV_REST_API_URL` | For analytics | Vercel KV REST URL |
| `KV_REST_API_TOKEN` | For analytics | Vercel KV token |
| `KV_REST_API_READ_ONLY_TOKEN` | Optional | Read-only KV access |
| `BLOB_READ_WRITE_TOKEN` | For GLB uploads | Vercel Blob token |
| `ADMIN_EMAILS` | For admin routes | Comma-separated admin email list |

**Demo mode:** If `NEXT_PUBLIC_SUPABASE_URL` is not set, all auth middleware is bypassed. All store owner pages are accessible without login. This is the current state on the live demo.

---

## 9. Getting Started

```bash
# Install dependencies
yarn install

# Start local dev server (http://localhost:3000)
yarn dev

# Type-check
yarn tsc --noEmit

# Lint
yarn lint

# Format
yarn format

# Production build
yarn build
```

MediaPipe WASM is loaded from CDN at runtime — no manual download needed.

**Without Supabase:** Leave `NEXT_PUBLIC_SUPABASE_URL` unset. All store owner pages are accessible without login (demo mode).

**With Supabase:**
1. Create a project at https://supabase.com
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
3. Enable Email auth in Supabase → Auth → Providers
4. Set redirect URL: `http://localhost:3000/auth/callback`

---

## 10. Deploy

```bash
vercel --prod
```

Vercel auto-deploys on push to `main`. `vercel.json` sets COOP/COEP headers required for SharedArrayBuffer (MediaPipe WASM threading).

**Set up Vercel KV for analytics:**
```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```

All environment variables must be added in Vercel → Project Settings → Environment Variables before deploying with auth or AI features enabled.

---

## 11. Current Status

| Feature | Status | Notes |
|---|---|---|
| AR try-on (/trydemo) | ✅ Live | 55 frames, 6 colour variants, mobile + desktop |
| Dashboard analytics | ✅ Live | Real data from Vercel KV, 30s auto-refresh |
| AI Stylist | ✅ Live | Requires `ANTHROPIC_API_KEY` |
| Supabase auth | ✅ Live | Requires Supabase env vars; demo mode if unset |
| Frame catalog (/frames) | ✅ Live | 9 curated styles, search + filter + sort |
| Upload wizard (/upload) | ✅ Live | 4-step, bg removal, GLB calibration |
| QR generator (/qr) | ✅ Live | PNG/SVG download, print |
| Sales one-pager (/onepager) | ✅ Live | Browser print → PDF |
| Pricing page | ✅ Live | 3 plans, monthly/annual toggle |
| Onboarding wizard | ✅ Live | 3 steps: Identity → PIN → Launch |
| Embedded widget | ✅ Live | `/embed` + `public/embed.js` |
| Frame comparison | ✅ Live | CompareTray side-by-side |
| Share + watermark | ✅ Live | Canvas compositing, Web Share API |
| Custom GLB upload | 🚧 Admin only | `/admin/generate-glb` + Vercel Blob |
| PD measurement | 🚧 Built | `pdMeasure.ts` — not surfaced in UI |
| Photochromic lenses | 🚧 Built | `photochromic.ts` — not surfaced in UI |
| Session recording | 🚧 Built | `recorder.ts` — not surfaced in UI |
| Real glasses photos | ❌ Not started | All frames use procedural geometry |

---

## 12. Sprint Status

| Sprint | PR | Status |
|---|---|---|
| Sprint 1 — Core AR Experience | #15 | ✅ Merged |
| Sprint 2 — Store Owner Tools + AI Stylist | #16 | ✅ Merged |
| Sprint 3–5 + Auth — Landing, Catalog, Sessions | #17 | ✅ Merged |
| Continue Build — Auth Wiring + Real Data | #18 | ✅ Merged |
| Figma Redesign Sprint (10 screens) | #20 | ✅ Merged |

See `SPRINT_STATUS.md` for full sprint details and `REDESIGN_REPORT.md` for Figma redesign implementation notes.

---

## Known Issues / Limitations

- No real `.glb` glasses photos — all 55 frames use procedural Three.js geometry
- Glasses Z-rotation corrected with flat `+Math.PI` — per-model tuning available via `rotationOffset` in `models.json`
- `vercel --prod` must be run from a local terminal (not from agent contexts)
- Formspree free tier: 50 pilot form submissions/month
