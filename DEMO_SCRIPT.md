# SpectaSnap — Store Demo Script

> **For:** Optical store owners and managers
> **Duration:** 5–7 minutes total
> **Goal:** Get the store owner to start a free 30-day trial

---

## Before You Begin (Setup Checklist)

- [ ] Open https://spectasnap-orpin.vercel.app/trydemo on a tablet or laptop
- [ ] Good, even lighting in the room (avoid harsh backlighting or window behind the subject)
- [ ] QR code printed (from /qr page) if doing a walk-up or counter display demo
- [ ] Dashboard open in a second tab (spectasnap-orpin.vercel.app/dashboard, PIN: 1234)
- [ ] Volume muted on the device
- [ ] Browser is Chrome or Edge (best WebGL performance; Safari works but may be slower)
- [ ] Camera permission already granted — do one test run before the owner walks in
- [ ] Tablet or laptop plugged in or fully charged (camera + WebGL drain battery)

---

## Opening (30 seconds)

> "Thank you for a few minutes. I want to show you something we built specifically for optical stores — it runs entirely in a browser, no app download, no extra hardware. Just a tablet or a screen you already have.
>
> It lets your customers try on glasses virtually, in real time, using just the front-facing camera. I'll show you the full thing in about five minutes."

**[Hand them the tablet, or turn your laptop to face them.]**

---

## Live AR Demo (2–3 minutes)

### Step 1 — Open the try-on

> "So this is the live demo. Watch what happens when I allow camera access."

- Open https://spectasnap-orpin.vercel.app/trydemo
- Grant camera access when prompted
- Let face tracking initialize — the "AR Live" badge in the top-right corner appears within 2–3 seconds

> "You see the badge up top says 'AR Live' — that means we've found 478 facial landmarks and we're tracking in real time at 60 frames per second. Nothing was installed. It's all running in this single browser tab."

### Step 2 — Try on a frame

- Click any frame in the bottom carousel (start with a classic rectangle for clarity)
- Hold up the device, or position it so both of you can see the glasses on the face

> "The glasses are rendered in full 3D — they rotate with the head, they have depth, they reflect the room light. This is not a flat 2D filter. It is an actual 3D object sitting on the face."

### Step 3 — Switch styles quickly

- Scroll through the bottom picker — tap aviator, then cat-eye, then a round frame
- Keep the pace snappy, roughly one per second

> "Your customers can flip through 55 different frame styles in seconds. No fetching frames from a back room, no cleaning a physical pair, no awkward waiting. They stay at the counter, they stay engaged."

### Step 4 — Change a colour variant

- Select any frame, then click the colour swatches in the right-side panel: Matte Black, then Tortoise, then Gold

> "Each frame comes in six colour variants — so one physical style becomes six virtual options. That means you can show more variety with less physical stock on the shelf."

---

## Show the Store Dashboard (1 minute)

**[Switch to the second browser tab — the Dashboard]**

> "This is your store's dashboard. Every try-on session gets logged — which frames were tried, how long they spent on each one, and the face shape distribution of everyone who walked in today."

- Point to the session count and the most-tried frames list
- Point to the face shape breakdown (oval, round, square, heart)

> "This is intelligence your physical mirror can never give you. If you see that 70% of your visitors have oval faces this month, you know exactly which frame shapes to push to the front of the display and which to reorder before you sell out.
>
> It is real purchase intent data, from your actual walk-ins."

---

## QR Code + In-Store Setup (30 seconds)

**[Open /qr or show the printed QR code]**

> "For in-store use, you print this QR code — we can print it for you — and place it next to your display stand. A customer walks in, scans it with their own phone, and they are trying on glasses before a staff member has even greeted them.
>
> No App Store. No loading screen longer than two seconds. It works on any smartphone from the last four years — Android or iPhone."

---

## AI Stylist Feature (1 minute)

**[Return to the demo page and open the AI Stylist section]**

> "We also built an AI Stylist — powered by Claude, Anthropic's AI. This is where it gets interesting for conversions."

- Launch the five-question quiz
- Walk through the questions: face shape (auto-detected from the camera), lifestyle, preferred material, occasion, and size preference

> "The AI takes the face shape we already measured from the camera — no guessing — plus what the customer tells us about how they live, and it produces a ranked shortlist of frames matched to that specific person.
>
> It is like having a trained optical consultant on staff at every hour of the day, including Sunday evenings when your store is closed and someone is shopping from home."

---

## Handle Objections

**"We already have a mirror."**

> "A mirror shows them one frame at a time — whichever they physically picked off the display. SpectaSnap lets them see 55 frames in the time it takes to walk to the mirror once. A mirror also doesn't log what was tried, doesn't track face shapes, and doesn't recommend the next frame. Your mirror is a great tool. This is a different tool."

**"Do customers need to download anything?"**

> "Nothing. Zero. It opens in any browser — Chrome on their Android phone, Safari on an iPhone, Edge on a laptop. No App Store, no account creation, no consent screen beyond camera permission. The customer just scans the QR and they are live in under ten seconds."

**"What about privacy?"**

> "All face tracking runs entirely on the customer's device, inside the browser tab. No video is ever sent to a server. No images are stored anywhere. We only log anonymized session data — which frame ID was tried, how long, and the detected face shape category. There is no way to identify an individual. We are fully GDPR and DPDP compliant by design, because the video never leaves the device."

**"Is it accurate?"**

> "We use MediaPipe's 478-point face landmark model — the same underlying technology Google ships in their consumer products. The 3D placement is accurate to within a few millimetres. It handles head rotation left and right, tilt, and varying lighting conditions. It is production-grade computer vision, not a consumer filter."

---

## Closing + Next Steps

> "Here is what I would suggest: start the free 30-day trial today. No credit card required. We will set up your store's QR code, get the dashboard live, and you will be running by tomorrow morning.
>
> After 30 days, the Professional plan is ₹2,999 per month — about ₹100 a day. For context, most stores tell us they make that back on the first upsell the AI Stylist drives in a single week.
>
> If you have multiple locations, there is a Business plan at $79 per month billed annually that covers all of them."

**[Hand them the device or scan the QR together]**

> "Want to try it on your own face right now?"

---

## Quick Stats to Quote

| Stat | Value |
|---|---|
| Frames in catalogue | 55 (6 colour variants each = 330 combinations) |
| Face landmarks tracked | 478 points, real-time |
| Rendering speed | 60 fps |
| App installs required | 0 |
| Setup time for a new store | Under 24 hours |
| Free trial | 30 days, no credit card |
| Starter plan | Free |
| Professional plan | ₹2,999/month (or $39/month billed annually) |
| Business plan | $79/month billed annually — multi-location |
| Demo URL | https://spectasnap-orpin.vercel.app/trydemo |
