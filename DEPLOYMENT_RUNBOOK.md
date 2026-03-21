# SpectaSnap — Deployment Runbook

> **Production URL:** https://spectasnap-orpin.vercel.app
> **Vercel project:** abidit-7188s-projects/spectasnap
> **Main branch:** `main` (auto-deploys on push)
> **Node version:** 18.x (set in Vercel project settings)

---

## Live Routes

| Route | Purpose |
|---|---|
| `/` | Landing page — B2B store owner marketing |
| `/trydemo` | Live AR try-on (noindex) |
| `/dashboard` | Store owner analytics dashboard (PIN: 1234) |
| `/qr` | Generate + download store QR codes |
| `/onepager` | Print-ready A4 sales card |

---

## Environment Variables (Required)

| Variable | Description | Where to get | Required for |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key for AI Stylist | https://console.anthropic.com → API Keys | AI Stylist feature (`/trydemo` quiz) |
| `KV_REST_API_URL` | Vercel KV REST endpoint | Auto-added by `npx vercel kv create spectasnap-sessions` | Session analytics dashboard |
| `KV_REST_API_TOKEN` | Vercel KV auth token | Auto-added by `npx vercel kv create spectasnap-sessions` | Session analytics dashboard |

**Notes:**
- Without `ANTHROPIC_API_KEY`, the AI Stylist quiz will return a graceful error — the rest of the app functions normally.
- Without KV variables, the dashboard shows empty state rather than crashing.
- Never commit `.env.local` to git. It is listed in `.gitignore`.

---

## Local Development

```bash
# Install dependencies
yarn install

# Create local env file (copy and fill in real values)
cp .env.example .env.local
# then edit .env.local and add ANTHROPIC_API_KEY

# Start dev server at http://localhost:3000
yarn dev

# Type-check only (no emit) — run before every commit
yarn tsc --noEmit

# Lint check
yarn lint

# Format all files with Prettier
yarn format

# Full production build (catches build-time errors lint/tsc miss)
yarn build

# Serve the production build locally
yarn start
```

**Important dev notes:**
- `reactStrictMode: false` is set in `next.config.mjs` — this is intentional to prevent double MediaPipe initialisation in development.
- `ARCamera` is loaded with `dynamic(() => import(...), { ssr: false })` because it requires browser APIs (camera, WebGL). Do not remove `ssr: false`.
- MediaPipe WASM is loaded from `cdn.jsdelivr.net` at runtime — dev machine must have internet access.

---

## Vercel Deployment

### First-time setup (run once per machine)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Link to the existing project (do not create new)
vercel link
# Select: abidit-7188s-projects → spectasnap
```

### Set environment variables in Vercel

Via the Vercel dashboard (recommended):
1. Go to https://vercel.com/abidit-7188s-projects/spectasnap/settings/environment-variables
2. Add each variable for **Production**, **Preview**, and **Development** environments
3. Click Save — variables take effect on the next deploy

Via CLI (alternative):
```bash
vercel env add ANTHROPIC_API_KEY production
# Paste the key value when prompted
```

### Set up Vercel KV (run once)

```bash
npx vercel kv create spectasnap-sessions
# Vercel automatically adds KV_REST_API_URL and KV_REST_API_TOKEN
# to the linked project's environment variables
vercel --prod
```

### Deploy to production

```bash
# Standard deploy (auto-deploys when you push to main via GitHub)
git push origin main

# Manual production deploy (bypasses GitHub, deploys current local build)
vercel --prod
```

**Note:** `vercel --prod` must be run from your local terminal. It cannot be run from an AI agent session.

### Preview deploys

Every branch push creates a preview URL automatically. Preview URLs follow the format:
`https://spectasnap-[branch-slug]-abidit-7188s-projects.vercel.app`

---

## DNS Setup (Custom Domain)

1. Go to https://vercel.com/abidit-7188s-projects/spectasnap/settings/domains
2. Add your custom domain (e.g. `spectasnap.io`)
3. Vercel provides the DNS records to add:
   - For apex domain: `A` record → `76.76.21.21`
   - For `www` subdomain: `CNAME` → `cname.vercel-dns.com`
4. Add the records in your DNS provider's dashboard (Namecheap, GoDaddy, Cloudflare, etc.)
5. DNS propagation takes 5 minutes to 48 hours — Vercel will show "Valid" when active
6. SSL certificate is provisioned automatically by Vercel (Let's Encrypt)

---

## Pre-Deploy Checklist

Run through every item before deploying to production.

**Code quality**
- [ ] `yarn tsc --noEmit` passes with zero errors
- [ ] `yarn lint` passes with zero errors (warnings acceptable)
- [ ] `yarn build` succeeds locally — no build-time errors
- [ ] No `console.log` debug statements left in production code
- [ ] No hardcoded test API keys or secrets in source code
- [ ] `.env.local` is not staged in git (`git status` shows it as untracked)

**Feature verification**
- [ ] AR try-on opens and "AR Live" badge appears within 3 seconds
- [ ] Frame switching works — at least 5 frames tested
- [ ] Colour variant switching works
- [ ] AI Stylist quiz completes and returns recommendations (requires `ANTHROPIC_API_KEY`)
- [ ] Dashboard loads and shows session data (or graceful empty state)
- [ ] QR code page generates a scannable QR
- [ ] One-pager route renders the printable card

**Landing page**
- [ ] Pilot form submits successfully (check Formspree dashboard for the test submission)
- [ ] All internal links (`#pilot`, `#stores`, `#how`) scroll to correct sections
- [ ] "Open Demo" CTA navigates to `/trydemo`
- [ ] Mobile sticky bar appears on viewport ≤1024px
- [ ] OG image renders correctly (check with https://opengraph.xyz)

**Infrastructure**
- [ ] All required environment variables are set in Vercel (Production environment)
- [ ] `vercel.json` COOP/COEP headers are present (required for MediaPipe threading)
- [ ] No `next.config.mjs` changes that would break the build

---

## Post-Deploy Verification

After every production deploy, verify the live site within 5 minutes.

- [ ] Landing page loads at the production URL — no blank screen, no 500 error
- [ ] `/trydemo` loads — camera permission prompt appears
- [ ] AR tracking activates — "AR Live" badge appears after granting camera
- [ ] At least 3 frames load and render correctly on a real face
- [ ] Colour swatch switching updates the frame in real time
- [ ] `/dashboard` loads and PIN prompt appears (PIN: 1234)
- [ ] `/qr` page renders and the QR code image is visible
- [ ] `/onepager` renders the print-ready layout
- [ ] AI Stylist quiz completes — no API error displayed (if key is set)
- [ ] Pilot form on landing page accepts a test submission (delete it from Formspree after)
- [ ] Check Vercel deployment logs for any runtime errors: https://vercel.com/abidit-7188s-projects/spectasnap/logs
- [ ] Lighthouse score on `/` is 90+ for Performance and SEO (run monthly, not every deploy)

---

## Rollback Procedure

### Option 1 — Instant rollback via Vercel dashboard (recommended)

1. Go to https://vercel.com/abidit-7188s-projects/spectasnap/deployments
2. Find the last known-good deployment (look for the green "Ready" badge before the bad deploy)
3. Click the three-dot menu on that deployment → **Promote to Production**
4. Vercel reroutes traffic instantly — no rebuild required

### Option 2 — Git revert and redeploy

```bash
# Revert the bad commit
git revert HEAD --no-edit

# Push the revert to trigger an auto-deploy
git push origin main
```

### Option 3 — Force deploy a specific commit

```bash
# Check out the last good commit
git checkout <good-commit-sha>

# Deploy it directly
vercel --prod

# Return to main
git checkout main
```

**Target rollback time:** Under 3 minutes using Option 1.

---

## Monitoring & Alerts

### Vercel Analytics (built-in)

- Real-time visitor data: https://vercel.com/abidit-7188s-projects/spectasnap/analytics
- Web Vitals (LCP, FID, CLS): https://vercel.com/abidit-7188s-projects/spectasnap/speed-insights
- Function logs (API routes, server components): https://vercel.com/abidit-7188s-projects/spectasnap/logs

### What to watch

| Signal | Warning threshold | Action |
|---|---|---|
| Build failure | Any failed build | Check build logs, fix and redeploy |
| 4xx error rate | >5% of requests | Check Vercel logs for bad routes |
| 5xx error rate | Any 5xx | Immediate — check API route logs |
| Anthropic API errors | Any 429 (rate limit) | Check usage at console.anthropic.com |
| Formspree submissions | >45/month (free tier limit is 50) | Upgrade Formspree plan |
| KV read/write errors | Any KV timeout | Check Vercel KV dashboard |

### Formspree

- Dashboard: https://formspree.io/forms
- Free tier: 50 submissions/month across all forms
- Upgrade if approaching limit before month end

### Anthropic API

- Usage dashboard: https://console.anthropic.com/usage
- Set a monthly spend limit to avoid surprises
- AI Stylist uses `claude-opus-4-6` — each quiz generates 1 API call

---

## Common Issues & Fixes

### Camera permission denied

**Symptom:** "AR Live" badge never appears; camera shows a blocked icon.
**Cause:** User denied camera permission, or the browser is in an insecure context (HTTP).
**Fix:**
- Ensure the site is served over HTTPS (Vercel always does this in production; use `https://localhost:3000` in dev if needed).
- Instruct the user to go to browser Settings → Site Permissions → Camera → Allow for this site.
- Refresh the page after granting permission.

### MediaPipe WASM fails to load

**Symptom:** AR does not start; browser console shows a network error fetching `.wasm` or `.js` files from `cdn.jsdelivr.net`.
**Cause:** Network blocked the CDN, or CDN is temporarily down.
**Fix:**
- Check if `cdn.jsdelivr.net` is reachable from the user's network (corporate firewalls sometimes block it).
- As a temporary workaround, self-host the MediaPipe WASM assets under `/public/mediapipe/` and update the CDN URL in `src/components/ARCamera.tsx`.
- Check CDN status at https://www.jsdelivr.com/statistics.

### Three.js WebGL context lost

**Symptom:** The 3D glasses disappear mid-session; console shows `WebGL context lost`.
**Cause:** Device ran out of GPU memory, or the browser suspended the WebGL context after inactivity.
**Fix:**
- `threeScene.ts` has a `webglcontextlost` listener that logs the event — check the console.
- Refresh the page to restore the context.
- On mobile, avoid running other GPU-intensive tabs alongside the try-on.
- If this happens repeatedly on a specific device, lower the Three.js renderer pixel ratio: find `renderer.setPixelRatio(...)` in `src/ar/threeScene.ts` and reduce the value.

### QR code not generating

**Symptom:** `/qr` page is blank or shows an error.
**Cause:** The QR generation library failed to initialise, or the store slug parameter is missing.
**Fix:**
- Check the browser console for JavaScript errors on `/qr`.
- Ensure the store slug query param is present (e.g. `/qr?store=my-store-name`).
- Verify the `qrcode` package is listed in `package.json` and `yarn install` was run.

### AI Stylist returns no results / shows an error

**Symptom:** The quiz completes but shows "Could not generate recommendations" or a spinner that never resolves.
**Cause:** `ANTHROPIC_API_KEY` is missing, invalid, or rate-limited.
**Fix:**
- Check that `ANTHROPIC_API_KEY` is set in Vercel environment variables for Production.
- Verify the key is valid and has available credits at https://console.anthropic.com.
- Check the API route logs in Vercel for the exact error message.
- If rate-limited (HTTP 429), wait a minute and retry; consider adding a monthly spend cap.

### Build fails with TypeScript error

**Symptom:** `yarn build` or the Vercel build step fails with a type error.
**Fix:**
```bash
# Run locally to see the exact error with file + line number
yarn tsc --noEmit

# Common causes:
# 1. A new prop added to a component without updating its Props type
# 2. A Three.js API used that does not match the installed version (0.183)
# 3. A missing return type on an async function
# 4. An import from a path that does not exist

# Once fixed, verify the build passes before pushing
yarn build
```

### Vercel auto-deploy not triggering

**Symptom:** You pushed to `main` but no new deployment appeared in the Vercel dashboard.
**Cause:** The GitHub integration may be disconnected, or the push was to the wrong branch.
**Fix:**
- Check https://vercel.com/abidit-7188s-projects/spectasnap/settings/git — verify GitHub repo is connected to the `main` branch.
- Confirm the push went to `origin main` (not a feature branch): `git log origin/main -1`.
- Trigger a manual deploy: `vercel --prod`.

### Frames not loading / showing wrong geometry

**Symptom:** A frame appears as an invisible object or renders with distorted geometry.
**Cause:** The `presetId` in `models.json` does not match any entry in `src/ar/presets.ts`, or the preset parameters produce degenerate geometry.
**Fix:**
- Open `public/models/models.json` and confirm the `presetId` for the affected frame matches a key in `src/ar/presets.ts`.
- Test the preset in isolation by calling `buildGlasses(preset)` from `proceduralGlasses.ts` in a browser console.
- Check the Three.js scene in the browser dev tools — use `window.__threeScene` if the scene is exposed for debugging.

---

## How to Add New Frames

1. Open `src/ar/presets.ts` — add a new `ProceduralPreset` entry with the shape parameters.
2. Open `public/models/models.json` — add a mapping entry:
   ```json
   "your-frame-id": { "type": "procedural", "presetId": "your-preset-key", "scaleMultiplier": 1.0 }
   ```
3. Open `src/lib/glasses-data.ts` — add the frame to `GLASSES_COLLECTION` with all required fields including `colorVariants`.
4. Run `yarn tsc --noEmit` and `yarn build` to verify.
5. Deploy.

## How to Update the Dashboard PIN

1. Open `src/app/dashboard/page.tsx`.
2. Find `const CORRECT_PIN = '1234'`.
3. Change the value.
4. Deploy.

## Formspree Endpoints

| Form | Endpoint | Fields |
|---|---|---|
| Pilot form (landing page) | `https://formspree.io/f/xojnpnzy` | name, store_name, city, email, phone, message |
| Frame upload | `https://formspree.io/f/xojnpnzy` | store_name, frame_name, style, photo |

Free tier allows 50 submissions/month across all forms combined. Upgrade at https://formspree.io/pricing if needed.
