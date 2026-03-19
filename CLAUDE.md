# SpectaSnap — Project README for AI Context

## What this is
SpectaSnap is a **browser-native, real-time 3D glasses AR try-on app** built for optical stores and online shoppers. No app install, no backend — runs entirely in the browser using MediaPipe face tracking and Three.js WebGL rendering.

**Live URL:** https://spectasnap-orpin.vercel.app  
**Demo page:** https://spectasnap-orpin.vercel.app/trydemo

---

## Tech stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 18 |
| Language | TypeScript (strict) |
| Styling | CSS Modules (`landing.module.css`) + Tailwind CSS (demo page only) |
| 3D rendering | Three.js 0.183 |
| Face tracking | MediaPipe Tasks Vision 0.10.14 (FaceLandmarker, 478 landmarks) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Lead capture | Formspree (`https://formspree.io/f/xojnpnzy`) |
| Deployment | Vercel (auto-deploy on git push) |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout — global metadata, Google Fonts preconnect, favicon
│   ├── page.tsx              # Landing page (Server Component) — exports Metadata + JSON-LD
│   ├── LandingClient.tsx     # Landing page UI (no 'use client' — server component)
│   ├── PilotForm.tsx         # 'use client' — B2B pilot lead capture form (Formspree)
│   ├── landing.module.css    # All landing page styles (design tokens, sections, form, sticky bar)
│   ├── globals.css           # Tailwind base + global resets
│   └── trydemo/
│       ├── layout.tsx        # /trydemo metadata — noindex, canonical
│       └── page.tsx          # AR demo page ('use client') — ARCamera + GlassesGrid + ProductCard
│
├── ar/
│   ├── threeScene.ts         # Three.js overlay — renderer, scene, camera, model loading/switching
│   ├── pose.ts               # MediaPipe → FaceTransform (position, IPD, pitch/yaw/roll) + EMA smoother
│   ├── proceduralGlasses.ts  # Generates Three.js geometry for glasses from presets (no GLB needed)
│   ├── presets.ts            # 50 frame presets (round, rectangle, aviator, cat-eye, sport-wrap)
│   ├── occluder.ts           # Face mesh occluder (hides glasses behind ears/nose)
│   ├── temples.ts            # Temple arms (side pieces) rendered separately
│   └── triangulation.ts     # MediaPipe face mesh triangle indices
│
├── components/
│   ├── ARCamera.tsx          # Main AR component — camera stream, MediaPipe loop, Three.js overlay
│   ├── ThreeOverlay.tsx      # Thin React wrapper around threeScene.ts
│   ├── GlassesGrid.tsx       # Horizontal scrollable frame picker at bottom of demo
│   ├── ProductCard.tsx       # Right sidebar — frame details, face shape, staff note
│   ├── Header.tsx            # Demo page header (SpectaSnap logo + AR Live badge)
│   └── LandingNav.tsx        # Landing page nav — desktop links + mobile hamburger ('use client')
│
├── lib/
│   ├── glasses-data.ts       # GLASSES_COLLECTION — 55 frames (5 featured + 50 procedural)
│   └── face-overlay.ts       # 2D canvas fallback overlay (unused in main flow)
│
public/
├── models/
│   └── models.json           # 3D model registry — maps frame IDs to type/presetId/scaleMultiplier
├── favicon.svg               # SVG favicon (glasses icon)
├── og-image.svg              # OG social preview image (1200×630)
├── robots.txt                # Allow all, Sitemap reference
└── sitemap.xml               # Landing page only (trydemo excluded)
```

---

## Key architecture decisions

### Landing page split (Server + Client)
`page.tsx` is a **server component** that exports `metadata` (SEO, OG, Twitter, JSON-LD) and renders `<LandingClient />`. `LandingClient.tsx` is also a server component. `LandingNav.tsx` and `PilotForm.tsx` are the only `'use client'` parts of the landing page. This keeps the landing page fully SSR for SEO.

### AR pipeline (demo page)
```
Webcam stream → MediaPipe FaceLandmarker (478 landmarks, 60fps)
  → pose.ts: computeTransform() → FaceTransform {cx, cy, ipd, pitch, yaw, roll}
  → pose.ts: smooth() → EMA-smoothed FaceTransform
  → threeScene.ts: applyFaceTransform() → positions/rotates Three.js model group
  → Three.js WebGL canvas composited over video element
```

### Model system (no GLB files)
All 55 frames use **procedural geometry** generated at runtime by `proceduralGlasses.ts` from presets in `presets.ts`. No `.glb` files exist. `models.json` maps frame IDs to `type: "procedural"` + `presetId`. The code supports `type: "glb"` for future real 3D models.

### Glasses orientation fix
`threeScene.ts` applies `MODEL_BASE_ROTATION_Z = Math.PI` (180°) to all models to correct for the default GLB/procedural mesh orientation relative to the face coordinate system.

---

## Landing page sections (in order)
1. **Nav** — fixed, blur backdrop, hamburger on mobile (`LandingNav.tsx`)
2. **Hero** — H1, subhead, two CTAs, dark AR preview mockup
3. **Stats bar** — 50+ frames, 478 landmarks, 60fps, 0 apps
4. **Problem** — split grid: pain points left, solution box right
5. **Demo highlight** — dark mockup with "Open Demo →" CTA
6. **Pilot section** (`id="pilot"`) — B2B lead capture with Formspree form
7. **For Stores** (`id="stores"`) — 6 feature cards grid
8. **How it works** (`id="how"`) — 3-step flow
9. **Final CTA** — dark section, "Launch AR Try-On"
10. **Footer**
11. **Sticky bar** — fixed bottom, visible ≤1024px, "Try Live Demo" + "Request Pilot"

---

## SEO setup
- **`/`** — indexed, canonical, OG image, Twitter card, JSON-LD (Organization + WebApplication)
- **`/trydemo`** — `noindex, follow`, canonical
- **`/robots.txt`** — Allow all, Sitemap URL
- **`/sitemap.xml`** — Landing page only
- **`/og-image.svg`** — 1200×630 SVG social card
- Google Fonts loaded via `<link>` in layout (not CSS `@import`) with `preconnect`

---

## Formspree lead capture
- **Endpoint:** `https://formspree.io/f/xojnpnzy`
- **Fields:** `name`, `store_name`, `city`, `email`, `phone` (optional), `message` (optional)
- **Flow:** fetch POST with `Content-Type: application/json` → success card or inline error
- **File:** `src/app/PilotForm.tsx`

---

## Design tokens (landing page)
```css
--bg:        #F7F7F5   /* page background */
--text:      #111111   /* primary text */
--muted:     #5C5C5C   /* secondary text */
--border:    #E6E6E3   /* borders */
--accent:    #2563EB   /* blue CTA */
--accent-dk: #1D4ED8   /* hover blue */
--white:     #FFFFFF
--radius:    12px
--radius-sm: 8px
```
Form inputs use `border-radius: 2px` (sharp, per spec).

---

## Known issues / future work
- No real `.glb` model files — all frames are procedural geometry
- Glasses orientation currently corrected with a flat `+Math.PI` Z rotation; per-model tuning via `rotationOffset` in `models.json`
- `vercel --prod` must be run manually from a local terminal (not from Cursor agent)
- Formspree free tier: 50 submissions/month

---

## Commands
```bash
npm run dev       # local dev server at localhost:3000
npm run build     # production build
npx tsc --noEmit  # type-check only
vercel --prod     # deploy to production (run in your terminal)
```



