# Sprint Status

**Last Updated:** 2026-03-20
**Live URL:** https://spectasnap-orpin.vercel.app

---

Sprint 1: Done
Sprint 2: Done (AI Stylist hidden — rule-based "Recommended For You" active; re-enable when ANTHROPIC_API_KEY is set)
Sprint 3: Done — ShareModal, Share My Look button, snapshot composite + watermark, WhatsApp share
Sprint 4: Done — branded loading overlay, /qr page, /onepager print sheet, WHATSAPP_TEMPLATES.md
Sprint 5: Done — /api/session, /api/stats, Vercel KV session logging, dashboard live data + 30s refresh
MVP Complete: Yes ✅

---

Realism Sprint: Done ✅
- Task 1: Per-style lens materials (default, dark, gold, clear, rose) with MeshPhysicalMaterial
- Task 2: Environment reflections via RoomEnvironment + PMREMGenerator
- Task 3: Frame material upgrade — acetate (clearcoat) vs metal (high metalness) + userData.role tagging
- Task 4: Soft shadow plane under glasses (NormalBlending, 12% opacity)
- Task 5: Kalman filter smoothing (kalmanjs) — near-zero jitter
- Task 6: Lens glare highlights (AdditiveBlending, white specular)
- Task 7: Photo-to-AR pipeline — @imgly/background-removal, custom frame upload/calibrate/test in AR
- Task 8: Face occluder improvements — FrontSide, 1.02x scale
- Task 9: Lens tint options — 6 tints (Clear, Smoke, Brown, Blue, Green, Mirror) with sidebar picker
Last Deploy: 2026-03-20

---

## CEO — ANTHROPIC_API_KEY (when ready)

```
1. vercel.com/dashboard
2. spectasnap → Settings → Environment Variables
3. Add: ANTHROPIC_API_KEY = sk-ant-...
   Environments: Production + Preview
4. vercel --prod
```

AI Stylist code is preserved in AIStylePanel.tsx — set the env var and it auto-activates.

---

## CEO — Vercel KV (Sprint 5 persistence — run once)

```bash
npx vercel kv create spectasnap-sessions
vercel --prod
```

Dashboard shows demo seed data until KV is provisioned. After setup, real session data flows automatically.
