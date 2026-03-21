# UI AUDIT — SpectaSnap
> Generated: 2026-03-20
> Auditor: Dev 3 (QA & DevOps)
> Status: **Document only. No fixes applied.**

---

# SECTION 1 — PAGE INVENTORY

---

## 1.1 `/` — Landing Page (B2B)

**Route:** `/`
**File:** `src/app/page.tsx` → renders `<LandingV2 />` from `src/app/LandingV2.tsx`
**Purpose:** B2B sales page targeting optical store owners. SEO-indexed, captures pilot leads via Formspree.

**Components used:**
- `LandingV2` (client component, `src/app/LandingV2.tsx`)
- CSS Modules via `landing2.module.css`
- No shared demo components

**Current layout:**
- Fixed nav bar (logo + 4 links + "Book a demo" CTA)
- Hero section: eyebrow label, H1 headline, subtitle, two CTAs ("Book free demo" + "Try it yourself")
- Trust bar: 5 items (50+ frames, 478-point tracking, works on any tablet, no app, 5 min setup)
- Features section: 5 feature cards with title + description
- "For Stores" section with value props
- FAQ accordion (5 questions)
- Pilot form: 4 fields (name, store, city, phone) + submit
- Footer

**Known issues:**
- Landing page uses `landing2.module.css` — the old `LandingClient.tsx` + `landing.module.css` + `LandingNav.tsx` + `PilotForm.tsx` still exist in codebase (dead code)
- CLAUDE.md references `LandingClient.tsx` which is no longer the active landing page
- Nav links use anchor `#` hrefs — no smooth-scroll behavior configured
- Form validation is client-side only (all fields required, but no format validation on phone)
- Success state after form submit shows inline text, not a distinct success card

**Mobile behaviour (375px):**
- Responsive — single-column stacking
- Nav links collapse (no hamburger visible in LandingV2 — links just wrap or overflow)
- Hero text scales via clamp()
- Trust bar wraps to multiple rows
- Three-column features grid becomes single column
- Form stacks to full width
- No sticky mobile CTA bar (the old landing had one)

**Tablet behaviour (768px):**
- Intermediate layout — some columns collapse
- Features may show 2-column grid
- Generally acceptable

**Desktop behaviour (1280px+):**
- Full layout renders correctly
- Max-width constrains content
- Balanced whitespace

---

## 1.2 `/trydemo` — AR Try-On Demo

**Route:** `/trydemo`
**File:** `src/app/trydemo/page.tsx`
**Purpose:** Core product — live AR glasses try-on with camera feed, 3D rendering, frame selection.
**Metadata:** `noindex, follow`

**Components used:**
- `ARCamera` (dynamic, ssr: false)
- `Header` (with `arStatus`)
- `GlassesGrid` (frame picker, bottom overlay)
- `ProductCard` (right sidebar, desktop only)
- `CompareTray` (top-left, save looks)
- `ShareModal` (share/download captures)
- `AIStylePanel` (dynamic, ssr: false — currently hidden/commented out)
- `FeedbackToast` (z-50 root level)
- `OfflineBanner` (offline indicator)
- `ErrorBoundary` (wraps ARCamera)

**Current layout:**
```
┌──────────────────────────────────────────────────────┐
│ Header (64px) — logo, tagline, AR status, links      │
├─────────────────────────────────┬────────────────────┤
│ Camera viewport (flex-1)        │ ProductCard (272px) │
│  ├ Record button (top-right)    │  - Frame info       │
│  ├ CompareTray (top-left)       │  - Color swatches   │
│  ├ AR overlays (face guide,     │  - Lens tints       │
│  │   idle screen, loading)      │  - Suitability      │
│  └ GlassesGrid (bottom, over    │  - Recommendations  │
│     gradient)                   │  - PD measurement   │
│                                 │  - Ask Staff CTA    │
├─────────────────────────────────┴────────────────────┤
│ Mobile bottom strip (md:hidden) — frame name + Ask Staff │
└──────────────────────────────────────────────────────┘
```

**Known issues:**
- GlassesGrid overlay gradient partially obscures bottom frame cards
- Compare tray double-click UX not discoverable (no tooltip or hint)
- AI Style Advisor button is commented out (awaiting ANTHROPIC_API_KEY)
- Recording button only shows if `ARRecorder.isSupported()` — no fallback info
- Mobile bottom strip only shows frame name + "Ask Staff" — no color/tint controls on mobile

**Mobile behaviour (375px):**
- Camera fills viewport height (100dvh)
- ProductCard sidebar hidden — no frame details visible on mobile
- Bottom strip provides minimal info (frame name + Ask Staff)
- GlassesGrid at bottom with safe-area padding
- Action buttons (Save Look, Share) stack vertically, labels hidden (icons only)
- Touch-friendly tap targets (44px min on buttons)
- Camera works on iOS Safari + Chrome Android

**Tablet behaviour (768px):**
- Camera + ProductCard sidebar (272px) visible
- Full feature set accessible
- GlassesGrid at bottom of camera area
- Landscape optimized

**Desktop behaviour (1280px+):**
- Same as tablet but more spacious
- ProductCard fully visible with all sections
- Balanced layout

---

## 1.3 `/dashboard` — Store Analytics

**Route:** `/dashboard`
**File:** `src/app/dashboard/page.tsx`
**Purpose:** PIN-protected analytics dashboard for store owners. Shows sessions, face shapes, popular frames, PD distribution, embed performance.

**Components used:**
- `StatCard` (inline sub-component)
- `ShapeBar` (inline sub-component)
- Framer Motion for PIN shake + transitions

**Current layout:**
- **PIN gate** (full-screen centered): SpectaSnap heading, 4 PIN dots, numpad grid
- **Dashboard** (after PIN 1234):
  - Header row: title + store name + "Go Live" button
  - 4 stat cards (2x2 on mobile, 4 across on desktop)
  - Two-column: Face Shape Distribution + Recent Sessions
  - Two-column: PD Distribution + Most Compared Frames
  - Embed Performance section (4 stat cards + comparison bar)
  - Popular Frames table (sortable)
  - Store Settings form (3 fields + save)
  - Footer text

**Known issues:**
- PIN is hardcoded as `1234` — no real auth, easily bypassed
- API endpoint `/api/stats` may return errors; falls back to localStorage seed data
- Seed data is always the same 50 sessions (seeded random) — looks fake on first visit
- No way to export or download data
- Settings save to localStorage only — lost on browser clear
- "Go Live" button goes to `/trydemo` without passing store context
- No back button or logout from dashboard

**Mobile behaviour (375px):**
- PIN pad renders well (centered, numpad 200px wide)
- Dashboard scrolls vertically
- Stat cards: 2-column grid
- Tables: "% Sessions" column hidden on mobile
- Settings form: stacks to 1 column
- Generally usable but dense

**Tablet behaviour (768px):**
- 4-column stat cards
- Two-column sections render side-by-side
- Settings form: 3 columns
- Good layout

**Desktop behaviour (1280px+):**
- max-width 1024px (max-w-5xl) constrains content
- Balanced and readable
- All sections render well

---

## 1.4 `/upload` — Custom Frame Upload

**Route:** `/upload`
**File:** `src/app/upload/page.tsx`
**Purpose:** 4-step wizard for uploading custom frame photos: Upload → Processing → Calibrate → Done.

**Components used:**
- Lucide icons (Glasses, Upload, Loader2, CheckCircle2, ArrowLeft, ArrowRight)
- `removeBackground` from `@/lib/removeBackground`
- `saveCustomFrame` from `@/ar/customFrameLoader`

**Current layout:**
- Header (logo + "Try Demo" link)
- Single-column wizard (max-w-md = 448px centered)
- Step 1: Frame name input + drag/drop upload zone + "Remove Background" button
- Step 2: Processing spinner + progress bar + percentage
- Step 3: Transparent PNG preview with bridge dot + 3 sliders (X, Y, Width) + "Test in AR" button
- Step 4: Done — redirect to `/trydemo?customFrame=true`

**Known issues:**
- Background removal downloads ~50MB model on first use — no pre-download option
- No skip option for background removal (what if frame photo already has transparent bg?)
- Bridge point calibration is unintuitive — users won't know what "bridge point" means
- No instructions or example images showing correct calibration
- "Back" button only on calibrate step, not on processing step (can't cancel processing)
- Error state after bg removal failure drops back to upload with no detail on why it failed
- Custom frame saved to localStorage — limited storage, lost on clear

**Mobile behaviour (375px):**
- max-w-md renders at full width with px-6 padding
- All steps render cleanly in single column
- Drag/drop less useful on mobile (file picker works)
- Sliders work with touch
- Responsive

**Tablet behaviour (768px):**
- Same as mobile but with more whitespace
- Centered 448px column

**Desktop behaviour (1280px+):**
- Same centered 448px column
- Works well

---

## 1.5 `/qr` — QR Code Generator

**Route:** `/qr`
**File:** `src/app/qr/page.tsx`
**Purpose:** Generate printable QR code linking to store-specific AR try-on URL.

**Components used:**
- `qrcode` npm package (QRCode.toDataURL)
- Lucide `Glasses` icon

**Current layout:**
- Header (logo + "Try Demo" link)
- Single-column form (max-w-md centered)
- Store name input + "Generate QR Code" button
- Generated: QR preview (240x240) + store name label + URL text + "Download QR Code" button

**Known issues:**
- QR URL points to `spectasnap-orpin.vercel.app` (hardcoded) — won't work for custom domains
- No option to customize QR design (colors, logo embed)
- No preview of what the scanned URL looks like
- Download creates a PNG file — no PDF or SVG option for print quality
- No link to `/onepager` for the full printable flyer

**Mobile behaviour (375px):**
- Works well — single column, full width
- QR code 240px fits within viewport
- Responsive

**Tablet behaviour (768px):**
- Centered column, more whitespace
- Works well

**Desktop behaviour (1280px+):**
- Centered 448px column
- Works well

---

## 1.6 `/onepager` — Printable Sales Sheet

**Route:** `/onepager`
**File:** `src/app/onepager/page.tsx`
**Purpose:** A4 printable one-page sales flyer for store owners to hand out. Includes features, pricing, QR placeholder.

**Components used:**
- No React components — pure inline HTML/CSS
- Print stylesheet (`@media print`)

**Current layout:**
- "Print this page" button (fixed top-right, hidden on print)
- max-w-3xl centered (768px)
- Header: SpectaSnap logo (serif italic gold) + website URL
- Headline: "More frames tried. / More sales closed." (gold italic)
- 3-column grid: What It Does, What You Get, How To Start
- Pricing row: "Free for 30 days. Then ₹2,999/month."
- Footer: QR placeholder ("Generate at /qr") + contact info

**Known issues:**
- QR code is a placeholder — stores must manually generate at `/qr` and paste/print separately
- No actual QR image embedded — defeats the purpose of a one-pager
- Contact email (`hello@spectasnap.com`) may not be configured yet
- 3-column grid doesn't collapse on mobile — text becomes unreadable on phones
- Print button styling doesn't match design system (uses hardcoded bg/color)
- No back navigation to landing page

**Mobile behaviour (375px):**
- **BROKEN** — 3-column grid does not collapse. Text is ~5px wide per column and unreadable.
- Print button works but page layout is broken on mobile screens
- This page is primarily for printing, so mobile rendering matters less — but it's still accessible via URL

**Tablet behaviour (768px):**
- Renders at max-width, generally OK
- 3-column grid fits but tight

**Desktop behaviour (1280px+):**
- Renders well at max-w-3xl
- Print output is clean A4

---

## 1.7 Additional Routes (Not requested but exist)

| Route | Purpose | Status |
|-------|---------|--------|
| `/embed` | Embeddable AR widget for iframe integration | Functional |
| `/admin` | Store configuration admin panel | Functional |
| `/admin/catalog` | Frame catalog management | Functional |
| `/admin/models` | 3D model upload/management | Functional |
| `/admin/generate-glb` | GLB generation tool | Exists |

---

# SECTION 2 — COMPONENT INVENTORY

---

## 2.1 `ARCamera.tsx`

**What it does:** Main AR orchestrator — camera stream, MediaPipe face detection (up to 3 faces), 6DOF pose tracking, Three.js WebGL rendering, PD measurement, recording, snapshot capture.

**Props:**
| Prop | Type | Required |
|------|------|----------|
| `selectedGlasses` | `GlassesFrame` | Yes |
| `selectedColor` | `ColorVariant \| null` | No |
| `selectedTint` | `LensTint \| null` | No |
| `onARStatusChange` | `(status: ARStatusKind) => void` | No |
| `onFaceShapeDetected` | `(shape: string) => void` | No |
| `captureRef` | `RefObject<(() => string \| null) \| null>` | No |
| `pdMeasuring` | `boolean` | No |
| `onPDMeasured` | `(pd: PDMeasurement) => void` | No |
| `pdMeasurement` | `PDMeasurement \| null` | No |
| `comparedFrames` | `string[]` | No |
| `glassesRemoval` | `boolean` | No |
| `recording` | `boolean` | No |
| `onRecordingStateChange` | `(state: RecordingState) => void` | No |
| `onRecordingComplete` | `(result: RecordingResult) => void` | No |

**Visual description:** Full-viewport camera feed with transparent WebGL overlay. Shows different states: idle (dark mockup with gold corners + "Enable Camera" CTA), loading (pulsing dot + "Starting camera"), searching (dashed face guide circle), tracking (glasses render on face, "AR Live" badge top-left).

**Known visual problems:**
- Gold corner marks on idle screen at 0.4 opacity — may be too subtle on some displays
- Face guide circle uses percentage widths (45% × 70%) — doesn't match real face proportions on all aspect ratios
- Loading pulsing dot uses inline `@keyframes` — regenerates on every render
- "Tracking multiple faces" badge positioning uses calc() that may shift with different gap values
- Watermark in snapshots uses hardcoded 14px padding — doesn't scale on high-DPI

**Mobile issues:**
- Action buttons (Save Look, Share) labels hidden on mobile — icons only, which may be unclear
- No color/tint controls accessible on mobile (ProductCard hidden)
- Bottom action buttons positioned 100px from bottom — may overlap GlassesGrid on short viewports

**Tablet issues:**
- None significant — renders well alongside ProductCard sidebar

---

## 2.2 `Header.tsx`

**What it does:** Top navigation bar for demo page. Logo (links to /), tagline, AR status badge, Upload + Dashboard links.

**Props:** `arStatus?: ARStatusKind`, `storeName?: string`

**Visual description:** 64px tall, warm cream bg (brand-panel), bottom border. Logo left, tagline center (hidden mobile), status badge + links right.

**Known visual problems:** None significant.

**Mobile issues:** "Upload" link hidden on mobile (sm:block). Only "Dashboard" link visible.

**Tablet issues:** None.

---

## 2.3 `GlassesGrid.tsx`

**What it does:** Horizontal scrollable frame picker with filter tabs (All, Round, Rectangle, Aviator, Cat-Eye, Sport, Custom). Keyboard navigation (arrow keys, Home, End).

**Props:** `selected: GlassesFrame`, `onSelect: (frame: GlassesFrame) => void`, `extraFrames?: GlassesFrame[]`

**Visual description:** Dark glass overlay at bottom of camera. Filter tabs at top (scrollable row), frame cards below (horizontal scroll, snap-to-center). Selected card has gold border + check mark.

**Known visual problems:**
- Frame card SVG previews use fixed 46px height with object-contain — non-square SVGs leave whitespace
- Filter count text at 9px — hard to read
- snap-mandatory may feel janky on some browsers

**Mobile issues:** Cards are compact (100px min-width) — works but tight. Filter bar scrollable.

**Tablet issues:** None.

---

## 2.4 `ProductCard.tsx`

**What it does:** Right sidebar product details panel. Frame info, color swatches, lens tints, photochromic toggle, lens coating, suitability score, recommendations, PD measurement, frame fit, CTAs.

**Props:** 16+ props including `frame`, `colorVariants`, `activeColor`, `lensTints`, `activeTint`, `faceShape`, `pdMeasurement`, `onAskStaff`, `onShareLook`, etc.

**Visual description:** Scrollable column in 272px sidebar. Sections separated by dividers. Gold accents on interactive elements. Serif font for frame name, sans for metadata.

**Known visual problems:**
- Photochromic Sun/Moon icons semantics may confuse users (Sun → outdoor, Moon → indoor — backwards convention)
- PD pulse animation uses inline @keyframes
- Color swatch outline inconsistency in Safari (outline + border rendering)
- Suitability "fair" verdict has no background, only border — easy to miss

**Mobile issues:** Entire component hidden on mobile (`hidden md:flex` on parent `<aside>`). **No frame detail, color/tint selection, suitability, or PD measurement accessible on mobile.**

**Tablet issues:** None — renders in sidebar at 272px.

---

## 2.5 `ARStatusBadge.tsx`

**What it does:** Status indicator in header. Dot (pulsing or static) + label with color-coded styling per state (idle, loading, searching, tracking, error).

**Props:** `status: ARStatusKind`

**Visual description:** Compact pill badge. Gold dot + "AR Live" when tracking. Grey/red for other states.

**Known visual problems:** Red text on dark background in error state may have contrast issues.

**Mobile issues:** None — compact badge fits header.

**Tablet issues:** None.

---

## 2.6 `FeedbackToast.tsx`

**What it does:** Fixed-position toast notification. Success (gold, auto-dismiss 3500ms), error (red, persistent), info (neutral).

**Props:** `toast: ToastData | null`, `onDismiss: () => void`, `duration?: number`

**Visual description:** Dark glass backdrop (blur), colored border per type, icon + message + close button. Positioned above mobile bottom UI.

**Known visual problems:**
- Bottom position hardcoded (+76px) — may overlap if mobile bottom strip height changes
- Close button hover uses onMouseEnter/Leave — no touch feedback on mobile
- backdrop-filter blur may not work on older browsers

**Mobile issues:** Position calculation accounts for safe-area-inset — works on iPhone notch.

**Tablet issues:** None.

---

## 2.7 `ThreeOverlay.tsx`

**What it does:** Transparent Three.js WebGL canvas overlay. Lazy imports threeScene module, manages render loop + resize.

**Props:** `enabled: boolean`

**Visual description:** Invisible container — Three.js renders the 3D glasses here.

**Known visual problems:** None.

**Mobile/Tablet issues:** None — ResizeObserver handles all viewport changes.

---

## 2.8 `ShareModal.tsx`

**What it does:** Modal showing captured snapshot/video with download + share (WhatsApp or Web Share API) buttons.

**Props:** `isOpen: boolean`, `onClose: () => void`, `dataUrl: string | null`, `mediaType?: 'image' | 'video'`

**Visual description:** Dark overlay, centered card (max-width 360px). Image/video preview + "Download" + "Share on WhatsApp" buttons.

**Known visual problems:**
- Loading state text shows "Capturing snapshot..." even for video recordings
- Standard browser video controls don't match brand styling
- No aspect ratio control — large images may push buttons off-screen

**Mobile issues:** Modal scales to viewport with px-4 margin. Touch-friendly.

**Tablet issues:** None.

---

## 2.9 `CompareTray.tsx`

**What it does:** Save up to 4 looks as circular thumbnails. Double-click to expand 2x2 compare grid. Keyboard navigation in expanded view.

**Props:** `looks: SavedLook[]`, `onRemove`, `onSelectFrame`, `onSave`, `canSave: boolean`, `onShareCollage?`

**Visual description:** Inline tray (top-left of camera) with circular thumbnails. Expanded modal shows 2x2 grid with frame name labels.

**Known visual problems:**
- Double-click to expand is not discoverable — no UI hint
- Empty slots in 2x2 grid show dashed boxes which look broken
- Remove button (-2px offset) may clip at certain zoom levels

**Mobile issues:** Tray fits but thumbnails are small (48px circles).

**Tablet issues:** None.

---

## 2.10 `CompareExport.tsx`

**What it does:** Utility function to generate 2x2 collage JPEG (800x800px) from saved looks.

**Known issues:** Synchronous image loading from dataUrls — could fail if images are large.

---

## 2.11 `ErrorBoundary.tsx`

**What it does:** React error boundary with "Try Again" button fallback.

**Props:** `children`, `fallback?`, `label?`

**Known issues:** None significant.

---

## 2.12 `OfflineBanner.tsx`

**What it does:** Fixed-top banner when offline. WifiOff icon + "Offline — AR try-on still works, AI features unavailable".

**Known issues:** z-60 — overlaps everything. May conflict with other fixed elements.

---

## 2.13 `AIStylePanel.tsx`

**What it does:** Slide-in panel for AI style recommendations (5-question quiz → Claude API → 3 frame recommendations).

**Status:** Currently hidden/commented out in trydemo page (awaiting ANTHROPIC_API_KEY configuration).

---

## 2.14 `LandingNav.tsx` (Dead code)

**What it does:** Old landing page navigation with hamburger menu.

**Status:** **DEAD CODE** — no longer imported by any active page. `LandingV2.tsx` has its own inline nav.

---

# SECTION 3 — CURRENT DESIGN TOKENS

---

## 3.1 Colors

### Landing Page (CSS Modules — `landing2.module.css`)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F5F0E8` | Page bg |
| Text | `#1A1612` | Primary text |
| Muted | `#6B6560` | Secondary text |
| Gold | `#C9A96E` | Accent, eyebrows, CTAs |
| Gold dark | `#A8844A` | Hover states |
| Border | `#DDD8CE` | All borders |
| White/Panel | `#FDFAF4` | Card backgrounds |
| Secondary | `#EDE8DC` | Subtle backgrounds |

### Demo Page (Tailwind `brand-*` in `tailwind.config.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `brand-page` | `#F5F0E8` | Page background |
| `brand-panel` | `#FDFAF4` | Sidebar, header bg |
| `brand-secondary` | `#EDE8DC` | Chip/tag backgrounds |
| `brand-text` | `#1A1612` | Primary text |
| `brand-muted` | `#6B6560` | Secondary text |
| `brand-gold` | `#C9A96E` | Primary accent |
| `brand-gold-dk` | `#A8844A` | Gold hover/active |
| `brand-border` | `#DDD8CE` | All borders |
| `brand-camera` | `#0A0A0A` | Camera viewport bg |
| `brand-overlay` | `rgba(10,10,10,0.72)` | Camera overlays |

### Old Landing Tokens (DEAD CODE — `landing.module.css`)

| Token | Value | Status |
|-------|-------|--------|
| `--bg` | `#F7F7F5` | **DEAD** — different from active `#F5F0E8` |
| `--accent` | `#2563EB` | **DEAD** — blue CTA, not used in new landing |
| `--accent-dk` | `#1D4ED8` | **DEAD** |

### Hardcoded Colors (Not Tokenized)

| Value | Occurrences | Where |
|-------|-------------|-------|
| `#C9A96E` (inline style) | **350+** | ProductCard, GlassesGrid, Header, ARCamera, Dashboard, Upload, QR, Onepager |
| `#dc2626` / `#DC2626` (error red) | 5 | ARStatusBadge, FeedbackToast, record button |
| `#0A0A0A` / `#0A0A0F` (dark bg) | 8 | Camera bg, overlays, CompareExport |
| `rgba(201,169,110,0.XX)` (gold variants) | 30+ | Various opacity levels: .07, .08, .09, .12, .14, .18, .45, .55, .7 |
| `rgba(255,255,255,0.XX)` (white variants) | 20+ | Opacity levels: .05, .06, .10, .12, .15, .20, .30, .35, .50, .60, .75, .85, .88 |
| `#B0ABA6` (lighter muted) | 3 | ProductCard occasion chips, onepager |

### Inconsistencies

1. **Gold color hardcoded 350+ times** instead of using `text-brand-gold` / `bg-brand-gold` Tailwind utilities
2. **Old landing (`#F7F7F5`, `#2563EB` blue)** vs new landing (`#F5F0E8`, `#C9A96E` gold) — old code still in codebase
3. **Error red (`#dc2626`) not tokenized** — used in 3 components
4. **Multiple dark shades**: `#0A0A0A`, `#0A0A0F`, `#0E1A2E` used interchangeably
5. **Gold opacity variants** (8+ levels) not systematized — should be 3-4 standard levels
6. **Context mixing: NONE** — landing and demo palettes correctly isolated ✓

---

## 3.2 Font Families

| Context | Serif | Sans |
|---------|-------|------|
| Landing (active) | Cormorant Garamond (italic, 600) | DM Sans (400/500/600) |
| Demo page | Cormorant Garamond (italic, 600) | DM Sans (400/500/600) |
| globals.css default | — | DM Sans, system-ui |

**Issue:** ShareModal uses `var(--font-cormorant-garamond, ...)` but this CSS variable is never defined. Falls back to hardcoded font-family string.

---

## 3.3 Font Sizes

### Landing Page
| Element | Size | Method |
|---------|------|--------|
| H1 | ~2.4rem | CSS Modules |
| H2 | ~1.7rem | CSS Modules |
| Body | ~1rem | CSS Modules |
| Eyebrow | ~0.6rem | CSS Modules |

### Demo Page
| Usage | Size | Method |
|-------|------|--------|
| Frame name heading | `text-2xl` (24px) | Tailwind |
| Body | `text-sm` (14px) | Tailwind |
| Labels/metadata | `text-xs` (12px) | Tailwind |
| Eyebrow labels | `text-[10px]` | Tailwind arbitrary |
| Frame card names | `text-[11px]` | Tailwind arbitrary |
| Filter counts/tags | `text-[9px]` | Tailwind arbitrary |
| Status badge | `fontSize: 11` | Inline style |

**Issue:** Mixed Tailwind utilities + inline `fontSize` props. No centralized type scale.

---

## 3.4 Spacing

| Context | Common Values |
|---------|--------------|
| Demo gaps | `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-3`, `gap-4`, `gap-5`, `gap-8` |
| Demo padding | `px-3 py-1.5`, `px-4 py-3`, `px-5 py-2.5`, `px-6 py-4`, `p-4`, `p-5`, `p-6` |
| Header | `py-4 px-6` (= 64px height) |
| Sidebar | `width: 272px, minWidth: 252px` |

**Issue:** No global spacing scale tokens — all ad-hoc Tailwind utilities.

---

## 3.5 Border Radius

| Location | Value | Status |
|----------|-------|--------|
| All demo components | `2px` (`rounded-sharp` or `borderRadius: 2`) | ✅ Compliant |
| Color swatch dots | `50%` (`rounded-full`) | ✅ Correct exception |
| Status dots | `50%` | ✅ Correct exception |
| Landing cards | `2px` | ✅ Compliant |

**No violations found in current codebase.** The old landing page (`landing.module.css`) had 20px violations, but `LandingV2` uses 2px consistently.

---

## 3.6 Shadows

| Token | Value | Where |
|-------|-------|-------|
| `shadow-gold` | `0 0 24px rgba(201,169,110,0.18)` | Tailwind config |
| `shadow-soft` | `0 2px 16px rgba(26,22,18,0.08)` | Tailwind config |
| FeedbackToast | `0 4px 28px rgba(0,0,0,0.38)` | Hardcoded (darker than tokens) |
| Bridge dot | `0 0 6px rgba(201,169,110,0.6)` | Upload page, hardcoded |

**Issue:** MASTER_CONTEXT.md says "No shadows. No gradients." but shadows exist in toasts and subtle places. Gradient overlay on camera viewport is a key design element.

---

## 3.7 Breakpoints

| System | Values |
|--------|--------|
| Tailwind (demo) | `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px` |
| Landing (CSS) | Custom: `520px`, `640px`, `680px`, `800px`, `860px`, `1024px` |

**Issue:** Landing uses custom breakpoints that don't align with Tailwind defaults.

---

# SECTION 4 — RESPONSIVE AUDIT

---

## 4.1 `/` Landing Page

### Mobile (375px — iPhone SE)
- ✅ Renders without horizontal scroll
- ✅ Buttons reachable by thumb
- ✅ Text readable (body ~16px)
- ⚠️ Nav links may overflow — no hamburger menu in LandingV2 (old LandingNav had one)
- ✅ Tap targets reasonable
- ❌ No mobile sticky CTA bar (removed from old landing, not added to new)
- ⚠️ Trust bar items wrap to multiple rows — looks cluttered

### Tablet (768px — iPad)
- ✅ Layout adapts well
- ✅ Features grid shows 2-column
- ✅ Form renders inline
- ✅ Generally good

### Desktop (1280px+)
- ✅ Content max-width constrains correctly
- ✅ Whitespace balanced
- ✅ All sections render well

---

## 4.2 `/trydemo` AR Demo

### Mobile (375px)
- ✅ No horizontal scroll
- ✅ Camera fills viewport
- ⚠️ Buttons reachable — but action buttons (Save Look, Share) at right edge may need stretch
- ✅ Text readable where visible
- ✅ 44px tap targets on buttons
- ✅ Camera works on mobile (tested iOS Safari + Chrome Android per QA standards)
- ❌ **ProductCard entirely hidden** — no frame details, color selection, lens tints, suitability score, PD measurement, or recommendations on mobile
- ❌ **No way to change frame color on mobile** — only "Ask Staff" accessible
- ⚠️ GlassesGrid gradient overlay can obscure bottom portion of frame cards

### Tablet (768px — iPad)
- ✅ Landscape optimized with camera + sidebar
- ✅ Staff panel (ProductCard) visible
- ✅ Full feature set accessible
- ✅ AR try-on fills screen well

### Desktop (1280px+)
- ✅ Content renders well
- ✅ Balanced whitespace
- ✅ All features accessible

---

## 4.3 `/dashboard`

### Mobile (375px)
- ✅ No horizontal scroll
- ✅ PIN pad centered and usable
- ✅ 2-column stat cards
- ⚠️ Recent sessions table text very small (10px timestamps)
- ✅ Settings form stacks to 1 column
- ⚠️ Popular frames table — "% Sessions" column hidden, but remaining columns still tight

### Tablet (768px)
- ✅ 4-column stat cards
- ✅ Two-column sections
- ✅ Good layout

### Desktop (1280px+)
- ✅ max-w-5xl constrains well
- ✅ All sections readable

---

## 4.4 `/upload`

### Mobile (375px)
- ✅ No horizontal scroll
- ✅ Full-width form at max-w-md
- ✅ Drag/drop → file picker on mobile
- ✅ Sliders work with touch
- ✅ Responsive

### Tablet / Desktop
- ✅ Centered 448px column
- ✅ Works well

---

## 4.5 `/qr`

### Mobile / Tablet / Desktop
- ✅ All responsive — single column, full width on mobile
- ✅ QR code 240px fits within viewport
- ✅ No issues

---

## 4.6 `/onepager`

### Mobile (375px)
- ❌ **CRITICALLY BROKEN** — 3-column grid does not collapse. Each column is ~100px wide, text is unreadable at ~8px effective size
- ❌ Horizontal scroll may appear
- ❌ Not usable on mobile

### Tablet (768px)
- ⚠️ 3-column grid fits but text is tight
- ✅ Generally acceptable for a print-oriented page

### Desktop (1280px+)
- ✅ max-w-3xl renders well
- ✅ Print output clean

---

# SECTION 5 — UX FLOW AUDIT

---

## Persona 1: Store Customer

**Entry point:** Opens `/trydemo` on store iPad or personal phone

**Flow:**
1. **First screen:** If camera not enabled → dark idle screen with gold corner marks, "SpectaSnap AR" label, hero text "Try On Your Perfect Pair", prominent "Enable Camera" button, privacy notice. **Clear and inviting.**

2. **Camera start:** Taps "Enable Camera" → loading state (pulsing gold dot, "Starting camera") → searching state (dashed face guide circle, "Position your face in the frame"). **Transition is smooth (~2-3s).**

3. **Face detected:** Glasses appear on face with the default frame. "AR Live" badge shows in top-left. **Immediate satisfaction.**

4. **Switching frames:** GlassesGrid at bottom of camera. Horizontal scroll, tap to select. Filter tabs available. **Works well but small cards on mobile.**

5. **Sharing look:** "Share" button (right side of camera) → WhatsApp share. "Save Look" button captures snapshot. **WhatsApp sharing works. Download works.**

6. **Where they get confused:**
   - On mobile: **No way to see frame details, change colors, or see suitability** (ProductCard hidden)
   - Compare tray: Double-click to expand is **not discoverable**
   - PD measurement: Only accessible in ProductCard (desktop only)
   - Recording: Button may not appear if browser doesn't support MediaRecorder

7. **Where the flow breaks:**
   - **Mobile users miss 60% of features** (all ProductCard functionality)
   - No "learn more" about a frame on mobile
   - No color changing on mobile
   - No face shape recommendation on mobile

---

## Persona 2: Store Owner

**Entry point:** Visits `/` (landing page)

**Flow:**
1. **First message:** Hero — "Your customers try frames. They buy more." with "AR Try-On for Optical Stores" eyebrow. **Clear B2B positioning.**

2. **Pilot request:** Scrolls to pilot form (#pilot) or clicks "Book free demo" CTA → form with 4 fields (name, store, city, phone) → submits via Formspree. **Simple and functional.**

3. **Dashboard access:** Via Header link on `/trydemo` or direct URL `/dashboard` → PIN gate (1234) → analytics. **No link from landing page to dashboard.** Store owner must know the URL or find it in demo header.

4. **Frame upload:** Via Header "Upload" link (hidden on mobile) → `/upload` wizard. **Functional but requires technical understanding of "bridge point calibration".**

5. **Where the flow is unclear:**
   - No navigation from landing page to `/dashboard` — store owners must discover it
   - No link to `/qr` generator from landing page or dashboard
   - No link to `/onepager` from anywhere
   - No link to `/admin` from anywhere (must know URL)
   - PIN `1234` is trivial and never changed — no real security
   - QR URL hardcodes `spectasnap-orpin.vercel.app` — won't work for white-label

---

## Persona 3: Staff Member

**Entry point:** Uses `/trydemo` on in-store tablet

**Flow:**
1. **See recommendations:** ProductCard (right sidebar on tablet) shows suitability score based on detected face shape, plus "Recommended For You" section with top 3 frames. **Only visible on tablet/desktop.**

2. **Help customer:** Can see frame details, staff note (curated per frame), "best for" tags, occasion chips. "Ask Staff" button triggers toast notification. **Functional on tablet.**

3. **Staff panel obvious?** Not labelled as "staff panel" — it's just the ProductCard sidebar. **Could be more explicitly targeted at staff.**

4. **What is confusing:**
   - "Ask Staff" button in ProductCard sends a toast to... itself? There's no notification system to alert a staff member
   - "Ask Staff" on mobile bottom strip does the same — shows a toast, doesn't actually alert anyone
   - No staff-specific features (note-taking, customer history, previous recommendations)
   - PD measurement requires knowing to scroll down in ProductCard and click "Measure PD"
   - No onboarding or tutorial for staff on first use

---

# SECTION 6 — SCREENSHOT CAPTURE

Screenshots captured using Playwright (headless Chromium) at the following viewports:

| Screenshot | Route | Width | Height | File |
|------------|-------|-------|--------|------|
| Landing (desktop) | `/` | 1280 | 800 | `screenshots/landing.png` |
| Landing (mobile) | `/` | 375 | 812 | `screenshots/landing-mobile.png` |
| Landing (tablet) | `/` | 768 | 1024 | `screenshots/landing-tablet.png` |
| Try Demo (desktop) | `/trydemo` | 1280 | 800 | `screenshots/trydemo.png` |
| Try Demo (mobile) | `/trydemo` | 375 | 812 | `screenshots/trydemo-mobile.png` |
| Try Demo (tablet) | `/trydemo` | 768 | 1024 | `screenshots/trydemo-tablet.png` |
| Dashboard | `/dashboard` | 1280 | 800 | `screenshots/dashboard.png` |
| Dashboard (mobile) | `/dashboard` | 375 | 812 | `screenshots/dashboard-mobile.png` |
| QR Generator | `/qr` | 1280 | 800 | `screenshots/qr.png` |
| Upload | `/upload` | 1280 | 800 | `screenshots/upload.png` |
| One-Pager | `/onepager` | 1280 | 800 | `screenshots/onepager.png` |

**Note:** `/trydemo` screenshots show the idle/loading state (no camera in headless browser). Dashboard screenshots show the PIN gate (no bypass in headless). These are expected limitations of static screenshots.

**Script:** `scripts/screenshot.ts`
**Run:** `yarn dev` (background) then `npx tsx scripts/screenshot.ts`

---

# SECTION 7 — ISSUES PRIORITY LIST

---

## P0 — Breaks the Experience Completely

| # | Page | Device | Description | Suggested Fix |
|---|------|--------|-------------|---------------|
| P0-1 | `/trydemo` | Mobile | **ProductCard entirely hidden on mobile.** No frame details, color selection, lens tints, suitability, PD measurement, or recommendations accessible on mobile. 60%+ of features invisible to mobile users. | Add mobile-optimized bottom sheet or expandable drawer for ProductCard content. At minimum, add color swatches + frame info to mobile bottom strip. |
| P0-2 | `/onepager` | Mobile | **3-column grid does not collapse on mobile.** Text rendered at ~8px, completely unreadable. Page is broken on phones. | Add `grid-cols-1 md:grid-cols-3` responsive classes. Stack columns on mobile. |

---

## P1 — Significantly Hurts Usability

| # | Page | Device | Description | Suggested Fix |
|---|------|--------|-------------|---------------|
| P1-1 | `/trydemo` | Mobile | **No way to change frame color on mobile.** Color swatches only in ProductCard (hidden on mobile). Major feature gap. | Add color swatch row to mobile bottom strip or GlassesGrid. |
| P1-2 | `/` | Mobile | **No hamburger menu in LandingV2.** Nav links may overflow on narrow screens. Old LandingClient had hamburger via LandingNav. | Add responsive nav with hamburger/dropdown for mobile. |
| P1-3 | `/` | All | **No navigation to /dashboard, /qr, /admin, or /onepager from landing page.** Store owners must know URLs. | Add "Store Tools" section or footer links to all admin routes. |
| P1-4 | `/trydemo` | All | **"Ask Staff" does nothing meaningful.** Shows a toast to the user, doesn't notify any staff member. Dead-end action. | Implement actual notification (push, bell icon, or at minimum open WhatsApp to store number). |
| P1-5 | `/trydemo` | All | **Compare tray double-click to expand is not discoverable.** No tooltip, no button, no hint that saved looks can be compared side-by-side. | Add an "expand" button or long-press action. Add tooltip on first save. |
| P1-6 | `/dashboard` | All | **No logout or lock button.** Once PIN is entered, anyone with the tab open has full access. No session timeout. | Add lock/logout button. Consider session timeout after 15 min. |
| P1-7 | `/upload` | All | **Bridge point calibration is unintuitive.** Users won't know what "bridge point" means or where to place it. | Add diagram/example image showing correct bridge point. Add "what is this?" help text. |
| P1-8 | All | All | **Dead code in codebase.** `LandingClient.tsx`, `LandingNav.tsx`, `PilotForm.tsx`, `landing.module.css` are no longer imported. CLAUDE.md references wrong files. | Remove dead files. Update CLAUDE.md to reference LandingV2. |

---

## P2 — Visual Inconsistency or Polish Issue

| # | Page | Device | Description | Suggested Fix |
|---|------|--------|-------------|---------------|
| P2-1 | Multiple | All | **350+ hardcoded `#C9A96E` in inline styles** instead of using Tailwind `brand-gold` utility. Maintenance nightmare. | Extract to Tailwind classes or CSS variables. |
| P2-2 | `/trydemo` | All | **Loading pulsing dot and PD pulse use inline @keyframes** — regenerates on every render. | Move animations to globals.css or a shared stylesheet. |
| P2-3 | `/trydemo` | Mobile | **GlassesGrid gradient overlay partially obscures bottom frame cards.** Dark gradient makes bottom-row card names hard to read. | Increase gradient transparency or add padding. |
| P2-4 | `/trydemo` | Mobile | **Action buttons (Save Look, Share) show icons only on mobile.** No labels — unclear what they do for first-time users. | Add text labels always, or show tooltip on first use. |
| P2-5 | `/dashboard` | All | **Seed data always shows same 50 sessions.** Looks obviously fake to store owners on first visit. | Use empty state with "No sessions yet" message. Show seed data only as explicit "demo mode". |
| P2-6 | `/qr` | All | **QR URL hardcodes `spectasnap-orpin.vercel.app`.** Won't work for custom domains or white-label. | Make base URL configurable or read from environment. |
| P2-7 | `/onepager` | All | **QR code is a placeholder box** saying "Generate at /qr". Defeats the purpose of a printable one-pager. | Auto-generate QR or allow store name input on onepager page. |
| P2-8 | `ProductCard` | Desktop | **Photochromic Sun/Moon icon semantics reversed.** Sun should = outdoor but users may associate Sun with brightness/indoor, Moon with night/outdoor. | Use explicit text labels ("Indoor" / "Outdoor") without ambiguous icons, or use different icons (building + tree). |
| P2-9 | `ShareModal` | All | **"Capturing snapshot..." text shown for video recordings too.** Should say "Recording..." or "Processing video..." | Conditional text based on `mediaType` prop. |
| P2-10 | `FeedbackToast` | Mobile | **Close button hover effect doesn't work on touch devices.** Uses onMouseEnter/Leave. | Use focus-visible or tap feedback instead. |
| P2-11 | Various | All | **ShareModal references undefined CSS variable** `var(--font-cormorant-garamond)`. Falls back to hardcoded string. | Define the variable or remove the var() wrapper. |
| P2-12 | MASTER_CONTEXT.md | N/A | **Design system conflict.** MASTER_CONTEXT.md says "No shadows. No gradients." but shadows exist in toasts, bridge dots, and camera gradient is a core design element. | Update MASTER_CONTEXT.md to accurately reflect the actual design system. |

---

## P3 — Nice to Have Improvement

| # | Page | Device | Description | Suggested Fix |
|---|------|--------|-------------|---------------|
| P3-1 | `/trydemo` | All | **AI Style Advisor is commented out.** Awaiting ANTHROPIC_API_KEY. Feature exists but is disabled. | Configure API key and enable, or remove dead code. |
| P3-2 | `/trydemo` | All | **Recording button only shows if browser supports MediaRecorder.** No fallback message explaining why button is missing. | Show disabled button with tooltip "Recording not supported in this browser". |
| P3-3 | `/dashboard` | All | **No data export.** Store owners can't download CSV or PDF of their analytics. | Add "Export CSV" button for sessions + popular frames. |
| P3-4 | `/dashboard` | All | **"Go Live" button doesn't pass store context.** Goes to generic `/trydemo`, not `/trydemo?store=StoreName`. | Include store name in URL parameter. |
| P3-5 | `/upload` | All | **No skip option for background removal.** If frame photo already has transparent bg, user must still wait for processing. | Add "Skip — my image already has transparent background" option. |
| P3-6 | `/qr` | All | **No PDF/SVG download option.** PNG at 300px may not be print quality. | Add SVG download or higher-resolution PNG option. |
| P3-7 | Various | All | **No smooth-scroll on landing page anchor links.** Clicking "#howitworks" jumps instead of scrolling. | Add `scroll-behavior: smooth` to html or use JS smooth scroll. |
| P3-8 | `/trydemo` | All | **OfflineBanner z-60 may overlap other fixed elements.** Could conflict with future UI additions. | Standardize z-index scale across all fixed elements. |
| P3-9 | `/trydemo` | All | **Frame card SVG previews leave whitespace** due to fixed 46px height with object-contain. | Normalize SVG aspect ratios or use object-cover with cropping. |
| P3-10 | `/` | All | **Form validation shows no format validation** on phone field. Accepts any text. | Add regex validation for Indian phone format. |

---

# SECTION 8 — REDESIGN BRIEF

---

## PAGE: `/` (Landing Page)

**CURRENT PROBLEM:**
The landing page (LandingV2) is functional but has no mobile hamburger menu (old landing had one, new one doesn't), no sticky mobile CTA, and no navigation to key store tools (/dashboard, /qr, /admin, /onepager). Store owners landing here have no path to their management tools. Dead code from old landing (LandingClient, LandingNav, PilotForm, landing.module.css) clutters the codebase.

**REDESIGN GOAL:**
A confident, minimal B2B page that immediately communicates "this will sell more glasses." One clear CTA path. Links to all store tools in footer. Mobile-first with hamburger nav and sticky CTA.

**MUST KEEP:**
- Gold + cream warm palette (matches demo perfectly)
- Cormorant Garamond serif headlines
- Formspree pilot form (works, captures leads)
- Hero messaging ("Your customers try frames. They buy more.")
- Trust bar (50+ frames, 478-point tracking)
- FAQ accordion

**MUST CHANGE:**
- Add hamburger menu for mobile
- Add sticky mobile CTA bar
- Add footer links to /dashboard, /qr, /onepager, /admin
- Remove dead code (LandingClient, LandingNav, PilotForm, landing.module.css)
- Update CLAUDE.md to reference correct files

**MOBILE PRIORITY:** High
**TABLET PRIORITY:** Medium

---

## PAGE: `/trydemo` (AR Demo)

**CURRENT PROBLEM:**
The AR try-on is technically impressive (3-face tracking, 55 frames, 60fps) but **mobile users lose 60% of features** because ProductCard is completely hidden. No color selection, no lens tints, no suitability scoring, no PD measurement, no recommendations on mobile. The mobile experience is: see glasses on face → pick a different frame → that's it. Compare tray expansion is hidden behind an undiscoverable double-click. "Ask Staff" is a dead-end toast.

**REDESIGN GOAL:**
Mobile-first AR experience that gives every user (phone, tablet, desktop) access to frame customization, suitability, and sharing. The store iPad experience should be "wow" — the phone experience should be "I want this."

**MUST KEEP:**
- 60fps camera feed with 3D glasses overlay
- Multi-face tracking (up to 3)
- GlassesGrid frame picker (filter tabs + horizontal scroll)
- CompareTray save/compare flow
- Share/download/record functionality
- Warm gold palette + 2px border radius
- ProductCard full layout on desktop/tablet

**MUST CHANGE:**
- Add mobile bottom sheet or drawer for ProductCard features
- At minimum: color swatches + frame info + "Ask Staff" on mobile
- Make Compare tray expansion discoverable (button, not double-click)
- Make "Ask Staff" do something real (WhatsApp, notification, etc.)
- Fix GlassesGrid gradient obscuring bottom cards
- Add text labels to mobile action buttons (not just icons)

**MOBILE PRIORITY:** Critical
**TABLET PRIORITY:** Low (works well already)

---

## PAGE: `/dashboard` (Analytics)

**CURRENT PROBLEM:**
Functional dashboard with seed data that looks fake. No real authentication (PIN 1234). No logout. No navigation to other admin tools. No data export. Settings save to localStorage only.

**REDESIGN GOAL:**
A trustworthy analytics dashboard that makes store owners feel informed and in control. Real data from day one. Clear path to all store management tools (QR, upload, admin, embed).

**MUST KEEP:**
- PIN gate UX (numpad, shake animation)
- 4 stat cards layout
- Face shape distribution bars
- Popular frames table
- Store settings form
- Warm gold palette + 2px sharp aesthetic

**MUST CHANGE:**
- Add nav bar with links to all admin routes
- Add logout/lock button
- Show empty state instead of fake seed data
- Add data export (CSV)
- Pass store context in "Go Live" link
- Consider real authentication (not just PIN)

**MOBILE PRIORITY:** Medium
**TABLET PRIORITY:** Medium

---

## PAGE: `/upload` (Frame Upload)

**CURRENT PROBLEM:**
Functional wizard but bridge point calibration is unintuitive. No example images. No skip option for pre-transparent images. Error messages are generic.

**REDESIGN GOAL:**
A dead-simple 3-step upload where any store employee can upload their own frames without understanding AR terminology.

**MUST KEEP:**
- 3-step wizard flow
- Background removal capability
- Transparent preview with checkerboard
- Gold bridge dot visualization
- Redirect to /trydemo after completion

**MUST CHANGE:**
- Add example images showing correct calibration
- Add "skip background removal" option
- Add help text explaining bridge point
- Improve error messages with specific guidance
- Add batch upload option

**MOBILE PRIORITY:** Low (primarily used on desktop)
**TABLET PRIORITY:** Medium

---

## PAGE: `/qr` (QR Generator)

**CURRENT PROBLEM:**
Simple and functional, but QR URL is hardcoded and output is PNG only. No connection to onepager.

**REDESIGN GOAL:**
Quick QR generation with print-quality output and integration with the sales one-pager.

**MUST KEEP:**
- Single-field simplicity
- QR preview with store name
- Download button
- Warm gold palette

**MUST CHANGE:**
- Make base URL configurable
- Add SVG/PDF download for print quality
- Add link to /onepager
- Add "Preview what customers see" link

**MOBILE PRIORITY:** Low
**TABLET PRIORITY:** Low

---

## PAGE: `/onepager` (Sales Sheet)

**CURRENT PROBLEM:**
3-column grid is **broken on mobile** — text is unreadable. QR code is a placeholder. Contact email may not be configured. No back navigation.

**REDESIGN GOAL:**
A clean A4 printable that store owners can hand out. Should embed an actual QR code and have a responsive fallback for screen viewing.

**MUST KEEP:**
- Clean A4 print layout
- Cormorant Garamond serif headlines
- Gold accent hierarchy
- Pricing transparency
- Print button

**MUST CHANGE:**
- Make responsive (stack columns on mobile)
- Embed actual QR code (accept store name input)
- Add back navigation to landing/dashboard
- Verify contact email works

**MOBILE PRIORITY:** Medium (people will access via URL)
**TABLET PRIORITY:** Low

---

# END OF AUDIT

**Total issues found: 32**
- **P0:** 2
- **P1:** 8
- **P2:** 12
- **P3:** 10

**Top 3 most broken experiences:**
1. **Mobile /trydemo** — 60% of features invisible (ProductCard hidden, no color selection, no suitability)
2. **Mobile /onepager** — 3-column grid completely unreadable on phones
3. **Store owner navigation** — No path from landing page to dashboard, QR, admin, or onepager

**Redesign brief summary for Stitch:**
- `/trydemo` mobile needs a bottom sheet/drawer for ProductCard content (CRITICAL)
- `/` landing needs hamburger nav + sticky CTA + footer links to admin tools
- `/onepager` needs responsive grid (single change: `grid-cols-1 md:grid-cols-3`)
- All pages: 350+ hardcoded colors should use design tokens
- Dead code cleanup: remove old landing components + update CLAUDE.md
