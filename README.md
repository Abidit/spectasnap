# SpectaSnap

**Browser-native real-time 3D glasses AR try-on** — no app install, no backend. Built for optical stores and online shoppers.

**Live:** https://spectasnap-orpin.vercel.app &nbsp;|&nbsp; **Demo:** https://spectasnap-orpin.vercel.app/trydemo

---

## Features

### AR Try-On Engine
- **60fps real-time tracking** using MediaPipe FaceLandmarker (478-point face mesh)
- **6DOF pose estimation** — position (x/y), inter-pupillary distance, pitch, yaw, roll
- **EMA smoothing** to eliminate jitter between frames
- **Face mesh occluder** — glasses render behind ears and nose for a realistic look
- **Temple arms** rendered separately from the frame, anchored to landmark positions
- **Yaw fade** — glasses opacity falls off naturally at extreme side-turn angles

### Frame Catalog
- **55 frames total** — all rendered as procedural Three.js geometry (no `.glb` files needed)
- **5 shape families:** round, rectangle, aviator, cat-eye, sport-wrap
- **6 color variants per frame:** Matte Black, Tortoise, Gold, Navy, Burgundy, Clear
- **Color swatch picker** in the product sidebar with live material updates
- Frame registry in `public/models/models.json` — supports future `.glb` model swaps

### Landing Page
- Fully SSR'd for SEO (Next.js server components)
- Sections: Hero, Stats bar, Problem/Solution, Demo highlight, B2B Pilot form, For Stores, How it works, Final CTA, Footer
- Sticky mobile CTA bar (visible ≤ 1024px)
- Mobile hamburger nav

### B2B Lead Capture
- Pilot request form via Formspree
- Fields: name, store name, city, email, phone (optional), message (optional)
- Inline success/error states — no page reload

### SEO & Social
- JSON-LD structured data (Organization + WebApplication schemas)
- OG image + Twitter card (`/og-image.svg`, 1200×630)
- `robots.txt` + `sitemap.xml` (landing page only; `/trydemo` is noindex)
- Google Fonts loaded with `<link>` + `preconnect` (no CSS `@import`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 18 |
| Language | TypeScript (strict) |
| 3D rendering | Three.js 0.183 |
| Face tracking | MediaPipe Tasks Vision 0.10.14 |
| Styling | CSS Modules (landing) + Tailwind CSS (demo) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Lead capture | Formspree |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout, metadata, Google Fonts
│   ├── page.tsx              # Landing page (Server Component) + JSON-LD
│   ├── LandingClient.tsx     # Landing page UI
│   ├── PilotForm.tsx         # B2B pilot lead capture form (client)
│   ├── landing.module.css    # All landing page styles + design tokens
│   ├── globals.css           # Tailwind base + global resets
│   └── trydemo/
│       ├── layout.tsx        # /trydemo metadata (noindex)
│       └── page.tsx          # AR demo page — camera + frame picker + sidebar
│
├── ar/
│   ├── threeScene.ts         # Three.js renderer, scene, model loading/switching
│   ├── pose.ts               # MediaPipe → FaceTransform + EMA smoother
│   ├── proceduralGlasses.ts  # Runtime geometry generation from presets
│   ├── presets.ts            # 50 frame presets + 6 color variants
│   ├── occluder.ts           # 478-pt face mesh occluder
│   ├── temples.ts            # Temple arm rendering (landmark-driven)
│   └── triangulation.ts     # MediaPipe face mesh triangle indices
│
├── components/
│   ├── ARCamera.tsx          # Camera stream, MediaPipe loop, Three.js overlay
│   ├── ThreeOverlay.tsx      # React wrapper for threeScene.ts
│   ├── GlassesGrid.tsx       # Horizontal scrollable frame picker
│   ├── ProductCard.tsx       # Frame details + color swatch sidebar
│   ├── Header.tsx            # Demo header (logo + AR Live badge)
│   └── LandingNav.tsx        # Landing nav with mobile hamburger
│
└── lib/
    ├── glasses-data.ts       # GLASSES_COLLECTION — 55 frames with color variants
    └── face-overlay.ts       # 2D canvas fallback (unused in main flow)

public/
├── models/
│   └── models.json           # Frame registry (presetId, scaleMultiplier, type)
├── favicon.svg               # SVG favicon
├── og-image.svg              # Social preview image (1200×630)
├── robots.txt
└── sitemap.xml
```

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

### Other commands

```bash
npm run build        # production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format all files
npm run format:check # Prettier check (CI)
npx tsc --noEmit     # type-check only
vercel --prod        # deploy to production (run locally)
```

---

## AR Pipeline

```
Webcam stream
  → MediaPipe FaceLandmarker (478 landmarks, 60fps)
  → pose.ts: computeTransform() → FaceTransform { cx, cy, ipd, pitch, yaw, roll }
  → pose.ts: smooth() → EMA-smoothed transform
  → threeScene.ts: applyFaceTransform() → positions + rotates Three.js model group
  → WebGL canvas composited over video element
```

---

## Known Limitations

- All frames are procedural geometry — no real `.glb` files yet
- Glasses orientation corrected globally with `+Math.PI` Z rotation; per-model tuning is supported via `rotationOffset` in `models.json`
- Formspree free tier: 50 submissions/month
