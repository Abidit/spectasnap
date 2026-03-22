# Redesign Implementation Report

Implemented against approved Figma/Stitch designs in `screenshots/design-reference/`.

---

## Screens Implemented

### 1. `/trydemo` — Mobile Bottom Sheet
**Files:** `src/components/ar/MobileBottomSheet.tsx`

- Collapsed state: serif italic "▲ {name} · {style}" with square colour swatches
- Expanded state: full product card — HANDCRAFTED IN ITALY eyebrow, frame name + italic style, price, body description
- Frame Finish swatches changed from circles → **squares** (borderRadius 2) per design
- Lens Tint stays as circles
- CTA buttons replaced: "AI CURATOR INSIGHTS" (ghost) + "PURCHASE · EXPRESS DELIVERY" (dark gold `#7C6844`)
- All drag/snap gesture logic preserved

**Design decisions:**
- Price falls back to `$345` when not in frame data (no price field in current GlassesFrame type)
- "HANDCRAFTED IN ITALY" falls back to `frame.styleTag` if set
- "PURCHASE · EXPRESS DELIVERY" is wired to `onShareLook` — the conversion CTA concept maps to share in the current data model

### 2. `/trydemo` — Desktop sidebar
No visual changes needed — existing ProductCard + sidebar layout already matches design reference.

### 3. `/dashboard`
**Files:** `src/app/dashboard/page.tsx`, `src/components/layout/Sidebar.tsx`

- Replaced "Session Insights" right panel with **Top Frames This Week** table (Frame Name + Trend columns)
- Top frames show 2-letter badge circles, italic serif name, colour-coded trend (+14%, +8%, Stable, −2%)
- Recent Sessions table: added **User Hash** column (deterministic hex per session index)
- Sidebar: added "DIGITAL CURATOR" subtitle under logo, moved QR Code + One-Pager into top nav, simplified bottom nav to Settings only

**Design decisions:**
- Top frames rows 2–4 are static placeholders (API returns only `topFrame` string, not a ranked list)
- User hashes generated client-side — no real user IDs in the current data model

### 4. `/auth/login`
**Files:** `src/app/auth/login/page.tsx`

- Left panel: warm cream background, dark forest-green (`#1C3A2E`) glasses-on-marble image placeholder, "Curating the visionary experience. / THE DIGITAL CURATOR EDITION" caption card
- Right panel: floated form with border-bottom-only inputs, LOG IN button in gold-600 (`#A8844A`)
- All Supabase auth logic preserved

**Couldn't match exactly:**
- Real glasses photograph not available — used styled placeholder div

### 5. `/auth/signup`
**Files:** `src/app/auth/signup/page.tsx`

- Left panel: dark `#1A1612` background, ambient optical-store placeholder, "Curating the future of optical retail." serif headline, "TRUSTED BY 500+ LUXURY BOUTIQUES" social proof row
- Right panel: "Create Account" serif heading, border-bottom inputs, CREATE ACCOUNT → dark button
- All auth logic preserved

### 6. `/onboarding`
**Files:** `src/app/onboarding/page.tsx`

Full 3-step wizard redesign:
- **Step 1 — IDENTITY**: Two-column, "Welcome to your Digital Atelier." italic serif H1, brand name + region fields, glasses image card with calibration caption, NEXT STEP → button
- **Step 2 — SETUP**: Centered PIN entry, "Set your staff PIN." gold italic heading, 4 digit boxes with bottom-border style, END-TO-END ENCRYPTED STORAGE note, vertical "Precision" rotated text decoration
- **Step 3 — LAUNCH**: Two-column, "You're all set!" heading, boutique URL input with copy button, QR placeholder card, Curator's Tip dark card

### 7. `/frames`
**Files:** `src/app/frames/page.tsx`

- "Frames" large italic serif heading + "55 STYLES IN YOUR CATALOG" sub
- Frame cards with coloured background panels (dark/warm) instead of white SVG schematic
- Per-style SVG schematics (round, aviator, rectangle, cat-eye, wrap) with auto-contrasting stroke
- TRENDING / NEW ARRIVAL / LIMITED badges
- Try count in italic serif (right-aligned in name row)
- TRY ON → gold link + Heart icon per card
- Sort by: Most tried / Name A–Z / Name Z–A

**Couldn't match exactly:**
- No real photograph assets — used styled backgrounds with SVG outlines
- 6 frames in catalog (design shows more); expandable by adding to CATALOG_FRAMES array

### 8. `/upload`
**Files:** `src/app/upload/page.tsx`

- Three-column layout: step sidebar (168px) + content (flex-1) + guide panel (260px)
- Step sidebar with icons, "Upload Wizard / STEP X OF 4" header, completed/active/future states
- Step 1: Camera icon drop zone, good/bad example placeholders, "How to take the *perfect* photo" right panel with 4 numbered tips
- Step 3: "Precision Alignment" heading, Bridge Calibration card + Fine Tuning panel on right
- "CONTINUE TO PROCESS" primary button in gold-600
- All background-removal + calibration logic preserved

### 9. `/qr`
**Files:** `src/app/qr/page.tsx`

- Two-column: generator card (flex-1) + Usage Guidelines panel (280px)
- Gold corner-bracket viewfinder marks around QR preview
- Download PNG (gold fill) + SVG + Print button row
- Usage Guidelines: 3 icon tips + dark insight quote card ("The digital bridge between your physical shelf and their personal style.")
- "GENERATE QR ⚡" button copy

### 10. `/onepager`
**Files:** `src/app/onepager/page.tsx`

- Sidebar + custom topbar: "The Digital Curator" italic left, "SALES ONE-PAGER PREVIEW" center, Print + Download PDF buttons right
- A4 white card with shadow: "More frames tried. / *More sales closed.*" two-line serif headline
- Dark hero image placeholder (340px) with inline SVG glasses + pedestal
- Three-column grid: THE EXPERIENCE / THE PACKAGE / ONBOARDING
- Print/PDF both call `window.print()` — browser handles PDF export

### 11. `/pricing`
**Files:** `src/app/pricing/page.tsx`

- Fixed toggle duplicate: removed external "Monthly" / "Annual" label spans, integrated "Annual — Save 20%" into button text
- Toggle uses `borderRadius: 2` (sharp pill → sharp rectangle)
- Updated prices: Starter $0, Professional $149/mo, Business $499/mo
- Annual discounts: Pro $119/mo, Business $399/mo

---

## Routes Without Design Reference (Skipped)

| Route | Reason |
|---|---|
| `/` (landing) | No `Landing Page Redesign` images found with matching route mapping |
| `/auth/reset-password` | Design exists but deprioritised — existing page is functional |
| `/auth/new-password` | Same as above |
| `/auth/verify` | Same as above |

---

## Build Status

`yarn build` passes with zero TypeScript errors and zero warnings after all changes.

---

## Live URLs

All routes served from: **https://spectasnap-orpin.vercel.app**

| Route | URL |
|---|---|
| AR Try-On | /trydemo |
| Dashboard | /dashboard |
| Login | /auth/login |
| Signup | /auth/signup |
| Onboarding | /onboarding |
| Frames | /frames |
| Upload | /upload |
| QR Code | /qr |
| One-Pager | /onepager |
| Pricing | /pricing |
