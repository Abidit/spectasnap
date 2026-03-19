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

## Design system standards

> **Every code change touching UI must comply with these rules before it ships.**
> These standards were codified from the component audit of March 2026.

---

### Rule 0 — Dual token system (never mix)

SpectaSnap has two completely separate styling contexts. Applying tokens from the wrong context is the most common mistake.

| Context | Files | Styling approach | Palette feel |
|---|---|---|---|
| **Landing page** | `src/app/landing.module.css`, `LandingClient.tsx`, `LandingNav.tsx`, `PilotForm.tsx` | CSS custom properties via CSS Modules | Clean SaaS blue |
| **Demo / AR page** | `src/app/trydemo/`, `src/components/*.tsx` | Tailwind `brand-*` utilities | Warm optical-boutique gold |

**Do not use `--accent` (blue) in demo components. Do not use `brand-gold` in landing CSS Modules.**

---

### Landing page tokens (`landing.module.css`)

```css
--bg:        #F7F7F5   /* page background */
--text:      #111111   /* primary text */
--muted:     #5C5C5C   /* secondary text */
--border:    #E6E6E3   /* dividers, card borders */
--accent:    #2563EB   /* primary CTA, links, highlights */
--accent-dk: #1D4ED8   /* accent hover state */
--white:     #FFFFFF
--card-bg:   #FFFFFF
--radius:    12px       /* cards, modals */
--radius-sm: 8px        /* buttons, badges */
--shadow:    0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)
--shadow-md: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)
```

Form inputs and sticky bar buttons use `border-radius: 2px` (sharp), not `--radius-sm`. This is intentional.

---

### Demo page tokens (`tailwind.config.ts` → `brand-*`)

```
brand-page:      #F5F0E8   warm parchment — page background
brand-panel:     #FDFAF4   slightly lighter — sidebar, header
brand-secondary: #EDE8DC   chip/tag backgrounds
brand-text:      #1A1612   near-black — primary text
brand-muted:     #6B6560   warm grey — secondary text
brand-gold:      #C9A96E   primary accent — selected states, CTAs, icons
brand-gold-dk:   #A8844A   gold hover / active / darker label text
brand-border:    #DDD8CE   warm sand — all dividers and borders
brand-camera:    #0A0A0A   camera viewport background
brand-overlay:   rgba(10,10,10,0.72) — gradient overlays on camera
```

Custom utilities also defined in `tailwind.config.ts`:

```
rounded-sharp    border-radius: 2px   — ALL buttons, chips, inputs, cards in demo
shadow-gold      0 0 24px rgba(201,169,110,0.18)
shadow-soft      0 2px 16px rgba(26,22,18,0.08)
font-serif       Cormorant Garamond, Georgia — frame names, hero text in demo
font-sans        DM Sans, system-ui — all UI labels, buttons, metadata
```

---

### Typography rules

**Landing page**

| Class | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `.h1` | Sora | `clamp(2.4rem, 5.5vw, 4rem)` | 800 | Page hero only |
| `.h2` | Sora | `clamp(1.7rem, 3.5vw, 2.4rem)` | 700 | Section headings |
| `.h3` | Sora | `1.15rem` | 600 | Card headings |
| `.label` | DM Sans | `0.72rem` | 700 | Eyebrow / section labels — uppercase, `tracking: 0.14em`, accent colour |
| `.subhead` | DM Sans | `clamp(1rem, 2vw, 1.2rem)` | 400 | Hero subtitle |
| `.body` | DM Sans | `0.975rem` | 400 | General prose |

**Demo page**

- Frame names → `font-serif` (Cormorant Garamond), sizes 18–24px, `font-semibold`
- All UI metadata (labels, tags, occasion chips) → `font-sans`, 9–11px, `font-semibold`, `uppercase`, `tracking-[0.12em]` or wider
- Body descriptions → `font-sans`, 13–14px, `font-normal`
- Eyebrow labels use `color: #C9A96E` (gold), never blue

---

### Spacing & layout rules

- Section padding on landing: `96px 5vw` (use `.section` class)
- Max content width: `1100px` (`.sectionWide`) or `720px` (`.sectionNarrow`)
- Demo sidebar width: `272px` (min `252px`) — do not change
- Demo header height: `64px` via `py-4 px-6` — do not change
- Camera gradient overlay: always `linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)`

---

### Border-radius rules

| Location | Value | Why |
|---|---|---|
| Landing cards, hero visual, demo frame | `12px` (`--radius`) | Rounded, approachable |
| Landing buttons, nav CTA, badges | `8px` (`--radius-sm`) | Slightly sharper |
| Landing form inputs, sticky bar buttons | `2px` | Sharp, precision instrument feel |
| **All demo page components** | `2px` (`rounded-sharp`) | Consistently sharp throughout boutique UI |

> **Rule:** Every element in the demo page uses `borderRadius: 2` or `rounded-sharp`. No exceptions. Do not use `rounded`, `rounded-md`, `rounded-lg`, or `rounded-full` in demo components unless it is a circular dot/avatar (e.g. color swatches, status dot).

---

### Component inventory

All components live in `src/components/`. Each has a defined contract — do not add props outside the pattern.

#### `ARStatusBadge` *(demo context)*
- **File:** `src/components/ARStatusBadge.tsx`
- **Props:** `status: ARStatusKind` — `'idle' | 'loading' | 'searching' | 'tracking' | 'error'`
- **Used in:** `Header.tsx` (top-right slot, light panel background)
- **States:** idle (grey, no pulse) → loading (gold pulse) → searching (muted pulse) → tracking (gold pulse, "AR Live") → error (red, no pulse)
- **Accessibility:** `aria-live="polite"`, `aria-label` with full status text
- **Do not:** hardcode status strings inline anywhere — always use this component

#### `FeedbackToast` *(demo context)*
- **File:** `src/components/FeedbackToast.tsx`
- **Props:** `toast: ToastData | null`, `onDismiss: () => void`, `duration?: number`
- **Type `ToastData`:** `{ message: string; type: 'success' | 'error' | 'info' }`
- **Used in:** `trydemo/page.tsx` (single instance, root level, `z-50`)
- **Rules:** success = gold border, auto-dismiss after 3500ms. Error = red border, **never** auto-dismiss. Info = neutral. Dark-glass backdrop (`rgba(26,22,18,0.91)` + `blur(14px)`). Position: fixed, above mobile bottom strip.
- **Accessibility:** `role="alert"` for errors, `role="status"` for success/info
- **Do not:** stack multiple toasts. Replace `toast` state with new value to replace.

#### `GlassesGrid` + `FrameFilterBar` *(demo context)*
- **File:** `src/components/GlassesGrid.tsx`
- **Props:** `selected: GlassesFrame`, `onSelect: (frame: GlassesFrame) => void`
- **Filter state:** local inside `GlassesGrid` — do not lift to parent
- **Filter families:** `all | round | rectangle | aviator | cat-eye | sport-wrap` — derived from `frame.style.toLowerCase().replace(/\s+/g, '-')`
- **Accessibility:** `role="tablist"` + `role="tab"` + `aria-selected` on filter buttons
- **Do not:** modify `GLASSES_COLLECTION` import — it is the single source of truth for all 55 frames

#### `ProductCard` *(demo context)*
- **File:** `src/components/ProductCard.tsx`
- **Props:** `frame`, `colorVariants?`, `activeColor?`, `onColorChange?`, `onAskStaff?: () => void`
- **Rules:** `onAskStaff` must always be wired — it is the primary conversion action. Never leave the CTA button without a handler. Occasion chips use the gold palette (`#C9A96E` border when active), not blue.

#### `Header` *(demo context)*
- **File:** `src/components/Header.tsx`
- **Props:** `arStatus?: ARStatusKind`
- **Rules:** When `arStatus` is provided, renders `ARStatusBadge` in the right slot. When not provided, renders a `w-7` spacer to maintain layout balance. Do not add more props without also updating the right-slot layout logic.

#### `ARCamera` *(demo context)*
- **File:** `src/components/ARCamera.tsx`
- **Props:** `selectedGlasses`, `selectedColor?`, `onARStatusChange?: (s: ARStatusKind) => void`
- **Rules:** Always pass `onARStatusChange` from the page level so `Header` and `ARStatusBadge` stay in sync. The callback fires on every `status` or `faceDetected` change via `useEffect`.

---

### Button patterns

**Landing page**

| Class | Use |
|---|---|
| `.btnPrimary` | Main CTA — blue fill, shadow, `translateY(-2px)` on hover |
| `.btnSecondary` | Secondary action — transparent, border, same hover lift |
| `.navCta` | Nav bar CTA — compact blue pill |
| `.ctaBtnPrimary` | Final CTA section — larger, on dark background |
| `.formSubmit` | Form submit — full-width, `border-radius: 2px` |
| `.stickyPrimary` / `.stickySecondary` | Mobile sticky bar — flat, sharp corners |

**Demo page** — All buttons use `rounded-sharp` (2px) and `font-sans font-semibold`. Dark fill buttons use `bg-brand-text text-brand-page`. Gold accent buttons use `style={{ backgroundColor: '#C9A96E' }}`.

---

### Feedback & state communication rules

1. **Never leave a CTA without a handler.** Every button that implies an action must call a function, even if the function is a stub. Dead-end buttons (`onClick` missing) are a bug.
2. **All async state must have a loading state.** If a component can be loading, ready, or errored, all three states must be handled visually (see `ARCamera` status enum as the reference pattern).
3. **Transient feedback → `FeedbackToast`.** Any action that completes without navigating away (e.g. "Ask Staff", saving a favourite, copying a share link) must confirm completion via `FeedbackToast`, not an inline element.
4. **Persistent errors → inline.** Errors that block the user (camera denied, model load failed) must be shown inline in the relevant component, not in a toast.
5. **AR tracking status → `ARStatusBadge` only.** Do not add secondary status indicators inside the camera viewport. The badge in `Header` is the canonical status surface.

---

### Accessibility checklist (run on every new component)

- [ ] Interactive elements have `aria-label` when label text is not visible
- [ ] Status/live regions use `aria-live="polite"` (or `"assertive"` for errors)
- [ ] Tab groups use `role="tablist"` + `role="tab"` + `aria-selected`
- [ ] Buttons are actual `<button>` elements (not `<div onClick>`)
- [ ] Disabled states set `disabled` prop (not just `opacity: 0.5`)
- [ ] Color is not the only differentiator — icons or text labels accompany color coding
- [ ] Focus styles are visible (do not remove `outline` without adding a `ring` replacement)
- [ ] Motion respects `prefers-reduced-motion` for any animation longer than 200ms

---

### What requires a design review before merging

- Any new colour value not already in the token tables above
- Any new `border-radius` value other than `2px` (demo) or `8px/12px` (landing)
- Any new typeface or font weight not listed in the typography table
- Adding a `position: fixed` or `z-index > 50` element
- Any change to the demo sidebar width, header height, or camera overlay gradient
- New interactive patterns (dropdowns, modals, drawers) — check against existing patterns first

---

## Known issues / future work
- No real `.glb` model files — all frames are procedural geometry
- Glasses orientation currently corrected with a flat `+Math.PI` Z rotation; per-model tuning via `rotationOffset` in `models.json`
- `vercel --prod` must be run manually from a local terminal (not from Cursor agent)
- Formspree free tier: 50 submissions/month

---

## Commands
```bash
yarn dev          # local dev server at localhost:3000
yarn build        # production build
yarn lint         # ESLint check
yarn format       # Prettier format all files
yarn tsc --noEmit # type-check only
vercel --prod     # deploy to production (run in your terminal)
```



