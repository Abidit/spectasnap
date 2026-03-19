# SpectaSnap — Deployment Runbook

## Live URLs

| Route | Purpose |
|---|---|
| `/` | Landing page (B2B store owners) |
| `/trydemo` | Live AR try-on experience |
| `/dashboard` | Store owner analytics (PIN: 1234) |
| `/upload` | Frame upload portal |

**Production URL:** https://spectasnap-orpin.vercel.app
**Vercel Project:** abidit-7188s-projects/spectasnap

---

## Environment Variables

| Variable | Required | Where |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | `.env.local` — enables AI Style Advisor |

No other env vars required. All data is client-side (localStorage).

---

## Deploy from Scratch

```bash
# 1. Clone the repo
git clone https://github.com/Abidit/spectasnap.git
cd spectasnap

# 2. Install dependencies
yarn install

# 3. (Optional) Add AI key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# 4. Local dev
yarn dev

# 5. Build check
yarn build

# 6. Deploy
vercel --prod
```

---

## Deploy Update

```bash
git add .
git commit -m "description of change"
git push origin main
# Vercel auto-deploys on push to main
```

**Manual deploy (if needed):**
```bash
vercel --prod
```

---

## How to Add New Frames

1. Open `src/ar/presets.ts`
2. Add a new `ProceduralPreset` entry with shape parameters
3. Add an entry in `public/models/models.json` mapping the frame ID to `type: "procedural"` + `presetId`
4. Add the frame to `src/lib/glasses-data.ts` GLASSES_COLLECTION array
5. Run `yarn build` to verify
6. Deploy

---

## How to Update Store PIN

1. Open `src/app/dashboard/page.tsx`
2. Find `const CORRECT_PIN = '1234'`
3. Change the value
4. Deploy

---

## Formspree Endpoints

| Form | Endpoint | Fields |
|---|---|---|
| Pilot form (landing) | `https://formspree.io/f/xojnpnzy` | name, store_name, city, email, phone, message |
| Frame upload | `https://formspree.io/f/xojnpnzy` | store_name, frame_name, style, photo |

**Free tier:** 50 submissions/month total across all forms.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Camera not starting | Check browser permissions. HTTPS required. |
| MediaPipe not loading | Check internet connection. CDN: cdn.jsdelivr.net |
| AI Stylist not working | Add `ANTHROPIC_API_KEY` to `.env.local`, restart dev |
| Build fails | Run `yarn tsc --noEmit` to find type errors |
| Glasses look wrong | Check `src/ar/presets.ts` for the frame preset |
| Deploy stuck | Run `vercel --prod` manually from terminal |

---

## Tech Stack Reference

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **3D:** Three.js 0.183
- **Face Tracking:** MediaPipe Tasks Vision 0.10.14
- **Styling:** Tailwind CSS + CSS Modules
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel
