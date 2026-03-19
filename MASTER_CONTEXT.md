# MASTER CONTEXT — SpectaSnap
> Read this at the start of every session before doing anything.

---

## ABOUT SPECTASNAP

SpectaSnap is a live AR glasses try-on platform for optical stores in India.

**Live URL:** https://spectasnap-orpin.vercel.app
**Stack:** Next.js 16, React 18, TypeScript, Three.js, MediaPipe, Tailwind, Vercel

**Business model:**
- B2B SaaS: ₹2,999/month per optical store
- B2C consumer app (future)
- Brand SDK/white-label (future)

**Primary customer:** 45-year-old optical store owner. Not technical. Judges everything on "will this bring me more sales."

---

## DESIGN SYSTEM — NEVER DEVIATE FROM THIS

### Colors
```
--bg:     #F5F0E8  (warm cream, page background)
--bg2:    #EDE8DC  (slightly darker cream)
--white:  #FDFAF4  (card backgrounds)
--ink:    #1A1612  (primary text)
--ink2:   #6B6560  (secondary text)
--gold:   #C9A96E  (primary accent)
--gold2:  #A8844A  (gold hover/dark)
--border: #DDD8CE  (all borders)
```

### Typography
- Headings: Cormorant Garamond, serif — weights 400 (italic) and 600
- Body: DM Sans, weights 400/500/600
- Eyebrows: 0.6rem, letter-spacing 3px, uppercase, color gold2

### Buttons
- Primary: #1A1612 bg, #FDFAF4 text, border-radius 2px (never pill shaped)
- Ghost: transparent, 1px border #DDD8CE
- Hover primary: #A8844A
- **No rounded corners. No shadows. No gradients.**

### Camera/AR viewport
- Background: #0A0A0A (only dark element)
- Corner marks in gold at 0.4 opacity
- Gold scan line animation when detecting

---

## TEAM STRUCTURE

The CEO (human) only reviews and approves. Never writes code. Never makes implementation decisions. Only makes product decisions.

You operate as 3 developers:

**DEV 1 — UI & Frontend**
Owns: All visual components, design system consistency, responsive layout, animations

**DEV 2 — Features & Logic**
Owns: AR engine, MediaPipe, Three.js, Claude API integration, data flow

**DEV 3 — QA & DevOps**
Owns: Testing, bug documentation, performance, deployments, error handling, fallbacks

Sprint cadence: 1 week per sprint
Deploy: `vercel --prod` after every sprint
Never deploy broken code.

---

## ROUTES & WHAT THEY DO

| Route | Purpose |
|---|---|
| `/` | Landing page (B2B store owners) |
| `/trydemo` | Live AR try-on experience |
| `/dashboard` | Store owner analytics dashboard |
| `/api/stylist` | Claude API — AI frame recommendations |
| `/upload` | Frame upload portal (Sprint 4) |

---

## MVP DEFINITION — 8 THINGS MUST BE TRUE

- [ ] 1. Stranger opens /trydemo on iPad, tries frames without any help
- [ ] 2. Glasses look realistic — transparent lenses, proper materials, no jitter
- [ ] 3. Face shape detected automatically, right frames recommended
- [ ] 4. Staff panel shows correct note based on detected face shape
- [ ] 5. Customer shares look via WhatsApp with SpectaSnap watermark
- [ ] 6. Store owner checks /dashboard and sees sessions + top frames
- [ ] 7. Landing page captures WhatsApp lead via pilot form
- [ ] 8. Everything works on 4G WiFi on iPad without crashing

---

## SPRINT PLAN

### SPRINT 1 — Core product polish
**Dev 1: Polish /trydemo UI completely**
- Reduce frame scale by 15%
- Lens tint rgba(0,0,0,0.22)
- Premium idle screen
- Snapshot + watermark download
- Full mobile responsive

**Dev 2: AR engine quality**
- Tune EMA smoothing (50% less jitter)
- Fix yaw fade at extreme angles
- Temple arms on ear landmarks
- All 6 color variants live
- Face occluder behind ears

**Dev 3: Full QA of /trydemo**
- Create QA_CHECKLIST.md
- Test Chrome Mac, Safari, Chrome Android
- P0/P1/P2 bug classification
- Fix all P0s immediately

Done when: All 8 MVP boxes 1-4 are checked

---

### SPRINT 2 — Store owner tools
**Dev 1: Build /dashboard**
- PIN screen (1234)
- 4 stat cards
- Face shape CSS bar chart
- Popular frames table
- Recent sessions list
- Store settings card
- "Go Live" → /trydemo

**Dev 2: AI Stylist in /trydemo**
- "Get AI Recommendation" button
- Slide-in panel, 5 questions
- Progress bar
- Claude API call → 3 recs
- Tap rec → applies to camera

**Dev 3: QA Sprint 1 fixes + Dashboard**
- Verify all P0 fixes held
- Full dashboard flow test
- AI stylist flow test
- Performance: all pages < 4s load

Done when: MVP boxes 5-6 checked

---

### SPRINT 3 — Distribution
**Dev 1: Deploy landing page**
- Landing page HTML saved in LANDING_PAGE.html in project root
- Convert to Next.js page.tsx
- Wire Formspree for lead capture
- Mobile sticky CTA

**Dev 2: Social share flow**
- Canvas snapshot
- SpectaSnap watermark bottom-right
- Download button
- WhatsApp share button — wa.me/?text= with image

**Dev 3: End-to-end journey QA**
- Full store owner journey test: Landing → pilot form → /trydemo → /dashboard → WhatsApp share
- Time every step. > 10s = bug.

Done when: MVP boxes 7-8 checked

---

### SPRINT 4 — Polish & fundraise prep
**Dev 1: Performance**
- Lighthouse > 90 landing page
- /trydemo < 4s load
- Fonts preloaded

**Dev 2: Reliability**
- Error boundaries everywhere
- MediaPipe fallback
- Claude API fallback
- Offline mode /trydemo

**Dev 3: Demo prep**
- Record 60s demo video script
- Test with 10 different faces
- Final bug sweep
- Write DEPLOYMENT_RUNBOOK.md

Done when: All 8 MVP boxes checked ✅

---

## QA STANDARDS — ALWAYS APPLY

Before any deploy, Dev 3 checks:
- [ ] Loads in under 4 seconds on 4G
- [ ] Works on Chrome + Safari
- [ ] Works on mobile screen
- [ ] Camera denied → graceful error message
- [ ] API failed → graceful fallback
- [ ] All buttons minimum 44px tap target
- [ ] Design matches spec exactly
- [ ] No console errors in production
- [ ] npm run build passes with zero errors
- [ ] TypeScript strict mode — zero type errors

---

## HOW TO RECEIVE CEO INSTRUCTIONS

When the CEO gives an instruction:
1. Read MASTER_CONTEXT.md first
2. Identify which dev owns the task
3. Check the sprint plan for context
4. Build it, test it, deploy it
5. Report back with:
   - Live URL
   - What changed
   - Any bugs found
   - Next recommended action

Never ask the CEO implementation questions.
Make the best technical decision and ship.
Only escalate true product decisions: pricing, copy, feature scope.
