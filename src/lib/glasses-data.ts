export interface GlassesFrame {
  id: string;
  name: string;
  color: string;
  style: string;
  styleTag: string;        // e.g. "ICONIC", "EDITORIAL"
  bestFor: string[];       // face shape recommendations
  occasions: string[];     // Casual | Office | Wedding | Sports
  staffNote: string;       // one-liner for staff to say
  svg: string;             // data URI
  scaleFactor: number;
  yOffset: number;
}

// ─── SVGs ────────────────────────────────────────────────────────────────────
// viewBox 0 0 500 200 (or 220 for aviator taller lenses)
// Each SVG has: radialGradient lens tint, glare arc, inner highlight strip
// Drop shadow is applied by canvas ctx.shadow* — not in SVG (more reliable)

const CLASSIC_BLACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="110" cy="84" r="100">
      <stop offset="0%"   stop-color="rgba(0,0,0,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="390" cy="84" r="100">
      <stop offset="0%"   stop-color="rgba(0,0,0,0.05)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>
    </radialGradient>
  </defs>
  <!-- Lens fills with gradient tint -->
  <rect x="13" y="46" width="194" height="108" rx="13" fill="url(#gl)"/>
  <rect x="293" y="46" width="194" height="108" rx="13" fill="url(#gr)"/>
  <!-- Thick acetate frames -->
  <rect x="13" y="46" width="194" height="108" rx="13" fill="none" stroke="#1a1a1a" stroke-width="16"/>
  <rect x="293" y="46" width="194" height="108" rx="13" fill="none" stroke="#1a1a1a" stroke-width="16"/>
  <!-- Bridge -->
  <path d="M207 94 C227 77 273 77 293 94" fill="none" stroke="#1a1a1a" stroke-width="10" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="219" cy="99" rx="7" ry="4" fill="#1a1a1a"/>
  <ellipse cx="281" cy="99" rx="7" ry="4" fill="#1a1a1a"/>
  <!-- Temples -->
  <line x1="15" y1="68" x2="-28" y2="60" stroke="#1a1a1a" stroke-width="14" stroke-linecap="round"/>
  <line x1="485" y1="68" x2="528" y2="60" stroke="#1a1a1a" stroke-width="14" stroke-linecap="round"/>
  <!-- Inner highlight — top edge of frame -->
  <rect x="24" y="48" width="172" height="4" rx="10" fill="rgba(255,255,255,0.14)"/>
  <rect x="304" y="48" width="172" height="4" rx="10" fill="rgba(255,255,255,0.14)"/>
  <!-- Glare arc — top-left of each lens -->
  <path d="M38,67 Q62,54 94,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M318,67 Q342,54 374,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const TORTOISESHELL_ROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="110" cy="90" r="90">
      <stop offset="0%"   stop-color="rgba(60,25,5,0.04)"/>
      <stop offset="100%" stop-color="rgba(60,25,5,0.22)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="390" cy="90" r="90">
      <stop offset="0%"   stop-color="rgba(60,25,5,0.04)"/>
      <stop offset="100%" stop-color="rgba(60,25,5,0.22)"/>
    </radialGradient>
  </defs>
  <!-- Lens fills -->
  <circle cx="110" cy="100" r="87" fill="url(#gl)"/>
  <circle cx="390" cy="100" r="87" fill="url(#gr)"/>
  <!-- Outer frame stroke (#8B4513 main) -->
  <circle cx="110" cy="100" r="87" fill="none" stroke="#8B4513" stroke-width="15"/>
  <circle cx="390" cy="100" r="87" fill="none" stroke="#8B4513" stroke-width="15"/>
  <!-- Accent highlight ring (D2691E lighter tone) -->
  <circle cx="110" cy="100" r="80" fill="none" stroke="#D2691E" stroke-width="2.5" stroke-opacity="0.55"/>
  <circle cx="390" cy="100" r="80" fill="none" stroke="#D2691E" stroke-width="2.5" stroke-opacity="0.55"/>
  <!-- Bridge -->
  <path d="M197 98 C217 82 283 82 303 98" fill="none" stroke="#8B4513" stroke-width="9" stroke-linecap="round"/>
  <!-- Tortoiseshell patches — left -->
  <ellipse cx="75"  cy="68"  rx="18" ry="12" fill="rgba(60,25,5,0.28)"   transform="rotate(-20,75,68)"/>
  <ellipse cx="142" cy="56"  rx="13" ry="9"  fill="rgba(180,90,20,0.22)" transform="rotate(10,142,56)"/>
  <ellipse cx="88"  cy="124" rx="15" ry="10" fill="rgba(60,25,5,0.22)"   transform="rotate(-10,88,124)"/>
  <!-- Tortoiseshell patches — right -->
  <ellipse cx="355" cy="68"  rx="18" ry="12" fill="rgba(60,25,5,0.28)"   transform="rotate(20,355,68)"/>
  <ellipse cx="418" cy="56"  rx="13" ry="9"  fill="rgba(180,90,20,0.22)" transform="rotate(-10,418,56)"/>
  <ellipse cx="368" cy="124" rx="15" ry="10" fill="rgba(60,25,5,0.22)"   transform="rotate(10,368,124)"/>
  <!-- Nose pads -->
  <ellipse cx="212" cy="105" rx="6" ry="4" fill="#8B4513"/>
  <ellipse cx="288" cy="105" rx="6" ry="4" fill="#8B4513"/>
  <!-- Temples -->
  <line x1="26"  y1="70" x2="-28" y2="60" stroke="#8B4513" stroke-width="13" stroke-linecap="round"/>
  <line x1="474" y1="70" x2="528" y2="60" stroke="#8B4513" stroke-width="13" stroke-linecap="round"/>
  <!-- Inner highlight arc — top of each lens -->
  <path d="M44,30 Q110,14 176,30" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="5" stroke-linecap="round"/>
  <path d="M324,30 Q390,14 456,30" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="5" stroke-linecap="round"/>
  <!-- Glare arc -->
  <path d="M48,58 Q70,44 100,52" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M328,58 Q350,44 380,52" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const AVIATOR_GOLD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 230">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="112" cy="120" r="105">
      <stop offset="0%"   stop-color="rgba(200,165,60,0.04)"/>
      <stop offset="100%" stop-color="rgba(200,165,60,0.20)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="388" cy="120" r="105">
      <stop offset="0%"   stop-color="rgba(200,165,60,0.04)"/>
      <stop offset="100%" stop-color="rgba(200,165,60,0.20)"/>
    </radialGradient>
  </defs>
  <!-- Left aviator lens fill — teardrop -->
  <path d="M22,62 Q16,155 72,186 Q132,212 188,166 Q222,134 210,62 Z" fill="url(#gl)"/>
  <!-- Right aviator lens fill -->
  <path d="M478,62 Q484,155 428,186 Q368,212 312,166 Q278,134 290,62 Z" fill="url(#gr)"/>
  <!-- Top brow bar (double bar aviator) -->
  <line x1="22"  y1="63" x2="210" y2="63" stroke="#C9A96E" stroke-width="6"/>
  <line x1="290" y1="63" x2="478" y2="63" stroke="#C9A96E" stroke-width="6"/>
  <!-- Second brow line below -->
  <line x1="22"  y1="74" x2="210" y2="74" stroke="#C9A96E" stroke-width="3" stroke-opacity="0.5"/>
  <line x1="290" y1="74" x2="478" y2="74" stroke="#C9A96E" stroke-width="3" stroke-opacity="0.5"/>
  <!-- Lens outline (thin metal) -->
  <path d="M22,62 Q16,155 72,186 Q132,212 188,166 Q222,134 210,62 Z" fill="none" stroke="#C9A96E" stroke-width="6"/>
  <path d="M478,62 Q484,155 428,186 Q368,212 312,166 Q278,134 290,62 Z" fill="none" stroke="#C9A96E" stroke-width="6"/>
  <!-- Bridge (thin double-bar) -->
  <path d="M210 64 Q250 54 290 64" fill="none" stroke="#C9A96E" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M214 74 Q250 66 286 74" fill="none" stroke="#C9A96E" stroke-width="3"   stroke-linecap="round" stroke-opacity="0.6"/>
  <!-- Nose pad wires -->
  <line x1="218" y1="82" x2="232" y2="96" stroke="#C9A96E" stroke-width="4" stroke-linecap="round"/>
  <line x1="282" y1="82" x2="268" y2="96" stroke="#C9A96E" stroke-width="4" stroke-linecap="round"/>
  <!-- Nose pad tips -->
  <ellipse cx="234" cy="99" rx="5" ry="3" fill="#C9A96E"/>
  <ellipse cx="266" cy="99" rx="5" ry="3" fill="#C9A96E"/>
  <!-- Temples -->
  <line x1="22"  y1="70" x2="-28" y2="60" stroke="#C9A96E" stroke-width="6" stroke-linecap="round"/>
  <line x1="478" y1="70" x2="528" y2="60" stroke="#C9A96E" stroke-width="6" stroke-linecap="round"/>
  <!-- Inner highlight — top edge -->
  <line x1="26"  y1="65" x2="208" y2="65" stroke="rgba(255,255,255,0.20)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="292" y1="65" x2="474" y2="65" stroke="rgba(255,255,255,0.20)" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Glare arc -->
  <path d="M42,84 Q66,70 98,78" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M322,84 Q346,70 378,78" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const CAT_EYE_RED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="112" cy="94" r="98">
      <stop offset="0%"   stop-color="rgba(180,0,30,0.04)"/>
      <stop offset="100%" stop-color="rgba(180,0,30,0.20)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="388" cy="94" r="98">
      <stop offset="0%"   stop-color="rgba(180,0,30,0.04)"/>
      <stop offset="100%" stop-color="rgba(180,0,30,0.20)"/>
    </radialGradient>
  </defs>
  <!-- Lens fills — cat-eye (upswept outer corners) -->
  <path d="M16,112 Q18,50 102,40 Q162,35 200,60 Q212,76 212,102 Q212,133 162,150 Q80,162 30,140 Z" fill="url(#gl)"/>
  <path d="M484,112 Q482,50 398,40 Q338,35 300,60 Q288,76 288,102 Q288,133 338,150 Q420,162 470,140 Z" fill="url(#gr)"/>
  <!-- Frame strokes (medium acetate) -->
  <path d="M16,112 Q18,50 102,40 Q162,35 200,60 Q212,76 212,102 Q212,133 162,150 Q80,162 30,140 Z"
        fill="none" stroke="#C0392B" stroke-width="13" stroke-linejoin="round"/>
  <path d="M484,112 Q482,50 398,40 Q338,35 300,60 Q288,76 288,102 Q288,133 338,150 Q420,162 470,140 Z"
        fill="none" stroke="#C0392B" stroke-width="13" stroke-linejoin="round"/>
  <!-- Bridge -->
  <path d="M212 86 C230 70 270 70 288 86" fill="none" stroke="#C0392B" stroke-width="8" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="224" cy="94" rx="6" ry="4" fill="#C0392B"/>
  <ellipse cx="276" cy="94" rx="6" ry="4" fill="#C0392B"/>
  <!-- Temples (from upswept outer point) -->
  <line x1="18"  y1="114" x2="-28" y2="102" stroke="#C0392B" stroke-width="11" stroke-linecap="round"/>
  <line x1="482" y1="114" x2="528" y2="102" stroke="#C0392B" stroke-width="11" stroke-linecap="round"/>
  <!-- Inner highlight — top edge (follows upswept shape) -->
  <path d="M24,108 Q28,54 104,44 Q158,40 196,62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="4" stroke-linecap="round"/>
  <path d="M476,108 Q472,54 396,44 Q342,40 304,62" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="4" stroke-linecap="round"/>
  <!-- Glare arc -->
  <path d="M36,70 Q58,54 90,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M316,70 Q338,54 370,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const RIMLESS_SILVER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="110" cy="92" r="96">
      <stop offset="0%"   stop-color="rgba(150,150,165,0.03)"/>
      <stop offset="100%" stop-color="rgba(150,150,165,0.16)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="390" cy="92" r="96">
      <stop offset="0%"   stop-color="rgba(150,150,165,0.03)"/>
      <stop offset="100%" stop-color="rgba(150,150,165,0.16)"/>
    </radialGradient>
  </defs>
  <!-- Lens fills -->
  <ellipse cx="110" cy="100" rx="93" ry="59" fill="url(#gl)"/>
  <ellipse cx="390" cy="100" rx="93" ry="59" fill="url(#gr)"/>
  <!-- Thin wire lens outline -->
  <ellipse cx="110" cy="100" rx="93" ry="59" fill="none" stroke="#A0A0A8" stroke-width="3.5"/>
  <ellipse cx="390" cy="100" rx="93" ry="59" fill="none" stroke="#A0A0A8" stroke-width="3.5"/>
  <!-- Bridge (thin wire) -->
  <path d="M203 96 Q250 82 297 96" fill="none" stroke="#A0A0A8" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Nose pad wires -->
  <line x1="214" y1="102" x2="224" y2="114" stroke="#A0A0A8" stroke-width="3" stroke-linecap="round"/>
  <line x1="286" y1="102" x2="276" y2="114" stroke="#A0A0A8" stroke-width="3" stroke-linecap="round"/>
  <!-- Nose pad loops -->
  <ellipse cx="226" cy="117" rx="5" ry="3" fill="none" stroke="#A0A0A8" stroke-width="2.5"/>
  <ellipse cx="274" cy="117" rx="5" ry="3" fill="none" stroke="#A0A0A8" stroke-width="2.5"/>
  <!-- Temples (thin) -->
  <line x1="18"  y1="78" x2="-28" y2="70" stroke="#A0A0A8" stroke-width="4" stroke-linecap="round"/>
  <line x1="482" y1="78" x2="528" y2="70" stroke="#A0A0A8" stroke-width="4" stroke-linecap="round"/>
  <!-- Hinge dots -->
  <circle cx="18"  cy="78" r="3.5" fill="#A0A0A8"/>
  <circle cx="482" cy="78" r="3.5" fill="#A0A0A8"/>
  <!-- Subtle inner highlight -->
  <path d="M24,64 Q110,48 196,64" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3" stroke-linecap="round"/>
  <path d="M304,64 Q390,48 476,64" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3" stroke-linecap="round"/>
  <!-- Glare arc -->
  <path d="M36,70 Q58,58 88,64" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M316,70 Q338,58 368,64" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

const WAYFARER_BLUE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <defs>
    <radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="110" cy="88" r="102">
      <stop offset="0%"   stop-color="rgba(20,50,110,0.05)"/>
      <stop offset="100%" stop-color="rgba(20,50,110,0.22)"/>
    </radialGradient>
    <radialGradient id="gr" gradientUnits="userSpaceOnUse" cx="390" cy="88" r="102">
      <stop offset="0%"   stop-color="rgba(20,50,110,0.05)"/>
      <stop offset="100%" stop-color="rgba(20,50,110,0.22)"/>
    </radialGradient>
  </defs>
  <!-- Lens fills — wayfarer (trapezoidal, wider at top) -->
  <path d="M8,50 L212,46 L212,152 Q212,162 201,163 L19,165 Q7,165 6,153 Z" fill="url(#gl)"/>
  <path d="M492,50 L288,46 L288,152 Q288,162 299,163 L481,165 Q493,165 494,153 Z" fill="url(#gr)"/>
  <!-- Thick acetate frame -->
  <path d="M8,50 L212,46 L212,152 Q212,162 201,163 L19,165 Q7,165 6,153 Z"
        fill="none" stroke="#1a3a6b" stroke-width="14" stroke-linejoin="round"/>
  <path d="M492,50 L288,46 L288,152 Q288,162 299,163 L481,165 Q493,165 494,153 Z"
        fill="none" stroke="#1a3a6b" stroke-width="14" stroke-linejoin="round"/>
  <!-- Thick brow bar (top edge reinforcement) -->
  <line x1="10"  y1="52" x2="210" y2="48" stroke="#1a3a6b" stroke-width="8" stroke-linecap="round"/>
  <line x1="290" y1="48" x2="490" y2="52" stroke="#1a3a6b" stroke-width="8" stroke-linecap="round"/>
  <!-- Bridge -->
  <path d="M212 90 C230 74 270 74 288 90" fill="none" stroke="#1a3a6b" stroke-width="9" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="224" cy="98" rx="7" ry="4" fill="#1a3a6b"/>
  <ellipse cx="276" cy="98" rx="7" ry="4" fill="#1a3a6b"/>
  <!-- Temples -->
  <line x1="8"   y1="68" x2="-30" y2="60" stroke="#1a3a6b" stroke-width="12" stroke-linecap="round"/>
  <line x1="492" y1="68" x2="530" y2="60" stroke="#1a3a6b" stroke-width="12" stroke-linecap="round"/>
  <!-- Inner highlight — top brow edge -->
  <line x1="14"  y1="52" x2="208" y2="48" stroke="rgba(255,255,255,0.16)" stroke-width="4" stroke-linecap="round"/>
  <line x1="292" y1="48" x2="486" y2="52" stroke="rgba(255,255,255,0.16)" stroke-width="4" stroke-linecap="round"/>
  <!-- Glare arc -->
  <path d="M24,68 Q48,54 80,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M304,68 Q328,54 360,62" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const GLASSES_COLLECTION: GlassesFrame[] = [
  {
    id: 'classic-black',
    name: 'Classic Black',
    color: '#1a1a1a',
    style: 'Rectangular',
    styleTag: 'TIMELESS',
    bestFor: ['Oval', 'Round', 'Heart'],
    occasions: ['Office', 'Casual', 'Wedding'],
    staffNote: 'A wardrobe staple — pairs effortlessly with every outfit and face shape.',
    svg: svgToDataUri(CLASSIC_BLACK),
    scaleFactor: 1.05,
    yOffset: -0.05,
  },
  {
    id: 'tortoiseshell-round',
    name: 'Amber Tortoise',
    color: '#8B4513',
    style: 'Round',
    styleTag: 'EDITORIAL',
    bestFor: ['Oval', 'Square', 'Oblong'],
    occasions: ['Casual', 'Office'],
    staffNote: 'The warm tortoiseshell softens angular features and flatters most complexions.',
    svg: svgToDataUri(TORTOISESHELL_ROUND),
    scaleFactor: 1.1,
    yOffset: -0.05,
  },
  {
    id: 'aviator-gold',
    name: 'Aviator Gold',
    color: '#C9A96E',
    style: 'Aviator',
    styleTag: 'ICONIC',
    bestFor: ['Oval', 'Heart', 'Diamond'],
    occasions: ['Casual', 'Sports'],
    staffNote: 'The teardrop shape elongates the face — a true classic that suits almost everyone.',
    svg: svgToDataUri(AVIATOR_GOLD),
    scaleFactor: 1.0,
    yOffset: 0.1,
  },
  {
    id: 'cat-eye-red',
    name: 'Scarlet Cat-Eye',
    color: '#C0392B',
    style: 'Cat-Eye',
    styleTag: 'COUTURE',
    bestFor: ['Oval', 'Heart', 'Square'],
    occasions: ['Casual', 'Wedding'],
    staffNote: 'The upswept corners lift the eyes — ideal for oval and heart-shaped faces.',
    svg: svgToDataUri(CAT_EYE_RED),
    scaleFactor: 1.0,
    yOffset: -0.08,
  },
  {
    id: 'rimless-silver',
    name: 'Rimless Silver',
    color: '#A0A0A8',
    style: 'Rimless',
    styleTag: 'MINIMAL',
    bestFor: ['Oval', 'Oblong', 'Diamond'],
    occasions: ['Office', 'Wedding'],
    staffNote: 'Ultra-lightweight and nearly invisible — lets strong features speak for themselves.',
    svg: svgToDataUri(RIMLESS_SILVER),
    scaleFactor: 1.08,
    yOffset: -0.02,
  },
  {
    id: 'wayfarer-blue',
    name: 'Ocean Wayfarer',
    color: '#1a3a6b',
    style: 'Wayfarer',
    styleTag: 'CLASSIC',
    bestFor: ['Oval', 'Round', 'Oblong'],
    occasions: ['Casual', 'Office'],
    staffNote: 'The bold brow bar adds structure — great for softening long or narrow face shapes.',
    svg: svgToDataUri(WAYFARER_BLUE),
    scaleFactor: 1.05,
    yOffset: -0.05,
  },
];
