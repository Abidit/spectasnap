# QA Checklist — SpectaSnap

> Dev 3 runs this before every deploy. Zero exceptions.

---

## Pre-Deploy Gate (ALL must pass)

- [ ] Loads in under 4 seconds on 4G
- [ ] Works on Chrome (Mac/Windows)
- [ ] Works on Safari (Mac/iOS)
- [ ] Works on Chrome Android
- [ ] Works on mobile screen (375px+)
- [ ] Camera denied → graceful error message shown
- [ ] API failed → graceful fallback, no crash
- [ ] All buttons minimum 44px tap target
- [ ] Design matches MASTER_CONTEXT spec exactly
- [ ] No console errors in production
- [ ] `yarn build` passes with zero errors
- [ ] TypeScript strict mode — zero type errors (`yarn tsc --noEmit`)
- [ ] `yarn lint` — zero ESLint errors

---

## /trydemo — AR Flow

- [ ] Page loads without error
- [ ] Camera permission prompt appears on first visit
- [ ] Camera denied → error screen with instructions
- [ ] Camera granted → video stream starts
- [ ] MediaPipe loads (loading state visible, spinner shown)
- [ ] Face detected → AR Live badge appears
- [ ] No face detected → face guide overlay shown
- [ ] Glasses render on face correctly positioned
- [ ] Glasses scale correctly to face width (IPD-based)
- [ ] Glasses rotate with face (roll/yaw/pitch tracking)
- [ ] Extreme yaw (>24°) → glasses fade smoothly
- [ ] Face exits frame → glasses hold 500ms then fade
- [ ] Face returns → glasses snap back
- [ ] Multiple faces → warning badge shown
- [ ] Frame picker (GlassesGrid) scrolls horizontally
- [ ] Tapping a frame switches the 3D model
- [ ] All 6 color swatches change frame color correctly
- [ ] ProductCard shows correct frame details
- [ ] Staff notes match detected face shape

## /trydemo — Mobile (≤768px)

- [ ] Camera fills full screen
- [ ] Frame picker visible at bottom
- [ ] Mobile header visible at top
- [ ] ProductCard hidden (shown on tablet+)
- [ ] All tap targets ≥ 44px
- [ ] No horizontal scroll overflow

---

## Landing Page (/)

- [ ] Page loads with correct fonts (Cormorant Garamond, DM Sans)
- [ ] Nav links scroll to correct sections
- [ ] Mobile hamburger opens/closes
- [ ] All 11 sections render correctly
- [ ] Pilot form submits successfully (Formspree)
- [ ] Pilot form shows success card on submission
- [ ] Pilot form shows inline error on failure
- [ ] "Open Demo →" CTA links to /trydemo
- [ ] Sticky bottom bar visible on mobile/tablet
- [ ] OG image renders correctly in social previews

---

## Bug Severity Classification

**P0 — Ship blocker. Fix before deploy.**
- App crashes
- Camera never starts
- Glasses don't render on face
- Build fails
- Any page returns 500/404

**P1 — Fix within 24 hours.**
- Glasses jitter significantly
- Wrong frame shown on selection
- Color variants don't apply
- Form submits but shows error
- Mobile layout broken

**P2 — Fix within sprint.**
- Minor visual misalignment
- Slight animation glitch
- Copy errors
- Non-critical missing feature

---

## Sprint 1 Bug Log

| ID | Severity | Description | Status | Fixed In |
|----|----------|-------------|--------|----------|
| — | — | — | — | — |
