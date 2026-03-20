# GLB Model Sourcing Guide for SpectaSnap

## Quick Start

### Option 1: Generate from Procedural Geometry (Recommended)
1. Visit `/admin/generate-glb` in the running app
2. Click "Generate & Download" for each family
3. Place the downloaded .glb files in `public/models/`
4. Update `models.json` entries to `type: "glb"`

### Option 2: Blender Template
1. Open `scripts/blender-glb-template.py` in Blender (Scripting tab)
2. Adjust parameters at the top of the script
3. Run the script (Alt+P)
4. The GLB file is exported automatically

### Option 3: SketchFab / External Sources
1. Search SketchFab for "eyeglasses" or "spectacles"
2. Filter by license: CC-BY or CC0
3. Download as GLB format
4. **Important:** After downloading, rename meshes to match SpectaSnap's naming convention

## Naming Convention

SpectaSnap's temple detection system looks for these mesh names:

| Mesh Name | Description |
|-----------|-------------|
| `frame_front` | Root group or parent empty |
| `frame_left` | Left rim/frame |
| `frame_right` | Right rim/frame |
| `lens_left` | Left lens |
| `lens_right` | Right lens |
| `bridge` | Nose bridge |
| `temple_left` | Left temple arm |
| `temple_right` | Right temple arm |

Alternative patterns also detected: `temple`, `arm`, suffixed with `_l`, `_r`, `left`, `right`.

## Orientation

- Bridge center at origin (0, 0, 0)
- Facing -Z (forward, toward the viewer)
- Y axis up
- Front face width: ~130-140mm (0.13-0.14 in Three.js units)

## After Adding GLB Files

1. Place `.glb` files in `public/models/`
2. In `models.json`, change the featured entry:
   - `"type": "procedural"` -> `"type": "glb"`
   - Ensure `"modelPath"` points to the correct file
   - Set `"hasTemples": true` if the model includes temple arms
   - Set `"templeMethod": "split"` for separate temple meshes
3. Test in the app -- the auto-calibrator will scale/position the model

## Recommended Sources

| Source | License | Quality | Price |
|--------|---------|---------|-------|
| SpectaSnap GLB Generator | MIT | Medium | Free |
| Blender Template | MIT | Customizable | Free |
| SketchFab | CC-BY/CC0 | High | Free |
| TurboSquid | Commercial | High | $5-20 |
| CGTrader | Commercial | High | $5-20 |
