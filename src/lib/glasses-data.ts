export interface GlassesFrame {
  id: string;
  name: string;
  brand: string;
  price: number;
  color: string;
  style: string;
  svg: string;
  // How wide the glasses are relative to face width (cheek-to-cheek)
  scaleFactor: number;
  // Vertical offset from eye-midpoint as fraction of glasses height (negative = up)
  yOffset: number;
}

// viewBox="0 0 500 200" — left lens ~10-210, right ~290-490, bridge 210-290
// Temples extend beyond edges for realistic look

const CLASSIC_BLACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Left lens -->
  <rect x="12" y="45" width="196" height="110" rx="14" ry="14"
        fill="rgba(0,0,0,0.08)" stroke="#111" stroke-width="13"/>
  <!-- Right lens -->
  <rect x="292" y="45" width="196" height="110" rx="14" ry="14"
        fill="rgba(0,0,0,0.08)" stroke="#111" stroke-width="13"/>
  <!-- Bridge -->
  <path d="M208 95 C228 78 272 78 292 95" fill="none" stroke="#111" stroke-width="9" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="220" cy="100" rx="7" ry="4" fill="#111"/>
  <ellipse cx="280" cy="100" rx="7" ry="4" fill="#111"/>
  <!-- Left temple -->
  <line x1="14" y1="68" x2="-30" y2="60" stroke="#111" stroke-width="11" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="486" y1="68" x2="530" y2="60" stroke="#111" stroke-width="11" stroke-linecap="round"/>
</svg>`;

const TORTOISESHELL_ROUND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Left lens round -->
  <circle cx="110" cy="100" r="88"
          fill="rgba(101,56,20,0.07)" stroke="#7B3F00" stroke-width="13"/>
  <!-- Right lens round -->
  <circle cx="390" cy="100" r="88"
          fill="rgba(101,56,20,0.07)" stroke="#7B3F00" stroke-width="13"/>
  <!-- Bridge -->
  <path d="M198 100 C218 82 282 82 302 100" fill="none" stroke="#7B3F00" stroke-width="8" stroke-linecap="round"/>
  <!-- Tortoiseshell patches on left lens -->
  <ellipse cx="75" cy="70" rx="18" ry="12" fill="rgba(60,25,5,0.25)" transform="rotate(-20,75,70)"/>
  <ellipse cx="140" cy="58" rx="12" ry="8" fill="rgba(180,90,20,0.2)" transform="rotate(10,140,58)"/>
  <ellipse cx="90" cy="120" rx="14" ry="10" fill="rgba(60,25,5,0.2)" transform="rotate(-10,90,120)"/>
  <!-- Tortoiseshell patches on right lens -->
  <ellipse cx="355" cy="70" rx="18" ry="12" fill="rgba(60,25,5,0.25)" transform="rotate(20,355,70)"/>
  <ellipse cx="420" cy="58" rx="12" ry="8" fill="rgba(180,90,20,0.2)" transform="rotate(-10,420,58)"/>
  <ellipse cx="370" cy="120" rx="14" ry="10" fill="rgba(60,25,5,0.2)" transform="rotate(10,370,120)"/>
  <!-- Nose pads -->
  <ellipse cx="213" cy="106" rx="6" ry="4" fill="#7B3F00"/>
  <ellipse cx="287" cy="106" rx="6" ry="4" fill="#7B3F00"/>
  <!-- Left temple -->
  <line x1="25" y1="72" x2="-28" y2="62" stroke="#7B3F00" stroke-width="11" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="475" y1="72" x2="528" y2="62" stroke="#7B3F00" stroke-width="11" stroke-linecap="round"/>
</svg>`;

const AVIATOR_GOLD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 220">
  <!-- Left aviator lens — teardrop: wider at bottom -->
  <path d="M20,60 Q15,150 70,180 Q130,205 185,160 Q220,130 208,60 Z"
        fill="rgba(212,175,55,0.08)" stroke="#B8860B" stroke-width="7"/>
  <!-- Right aviator lens -->
  <path d="M480,60 Q485,150 430,180 Q370,205 315,160 Q280,130 292,60 Z"
        fill="rgba(212,175,55,0.08)" stroke="#B8860B" stroke-width="7"/>
  <!-- Top bar across left lens -->
  <line x1="20" y1="62" x2="208" y2="62" stroke="#B8860B" stroke-width="5"/>
  <!-- Top bar across right lens -->
  <line x1="292" y1="62" x2="480" y2="62" stroke="#B8860B" stroke-width="5"/>
  <!-- Bridge -->
  <path d="M208 62 Q250 52 292 62" fill="none" stroke="#B8860B" stroke-width="6" stroke-linecap="round"/>
  <!-- Nose pads (angled) -->
  <line x1="218" y1="80" x2="230" y2="92" stroke="#B8860B" stroke-width="5" stroke-linecap="round"/>
  <line x1="282" y1="80" x2="270" y2="92" stroke="#B8860B" stroke-width="5" stroke-linecap="round"/>
  <!-- Left temple -->
  <line x1="20" y1="68" x2="-28" y2="58" stroke="#B8860B" stroke-width="7" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="480" y1="68" x2="528" y2="58" stroke="#B8860B" stroke-width="7" stroke-linecap="round"/>
</svg>`;

const CAT_EYE_RED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Left cat-eye: normal inner, upswept outer -->
  <path d="M15,110 Q18,50 100,42 Q160,38 198,60 Q210,75 210,100 Q210,130 160,148 Q80,158 30,138 Z"
        fill="rgba(180,0,0,0.07)" stroke="#C0002A" stroke-width="11" stroke-linejoin="round"/>
  <!-- Right cat-eye (mirrored) -->
  <path d="M485,110 Q482,50 400,42 Q340,38 302,60 Q290,75 290,100 Q290,130 340,148 Q420,158 470,138 Z"
        fill="rgba(180,0,0,0.07)" stroke="#C0002A" stroke-width="11" stroke-linejoin="round"/>
  <!-- Bridge -->
  <path d="M210 88 C228 72 272 72 290 88" fill="none" stroke="#C0002A" stroke-width="8" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="222" cy="96" rx="6" ry="4" fill="#C0002A"/>
  <ellipse cx="278" cy="96" rx="6" ry="4" fill="#C0002A"/>
  <!-- Left temple from outer point -->
  <line x1="15" y1="112" x2="-28" y2="100" stroke="#C0002A" stroke-width="9" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="485" y1="112" x2="528" y2="100" stroke="#C0002A" stroke-width="9" stroke-linecap="round"/>
</svg>`;

const RIMLESS_SILVER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Left lens rimless — very thin oval outline -->
  <ellipse cx="110" cy="100" rx="94" ry="60"
           fill="rgba(192,192,192,0.04)" stroke="#A8A8B0" stroke-width="3.5"/>
  <!-- Right lens rimless -->
  <ellipse cx="390" cy="100" rx="94" ry="60"
           fill="rgba(192,192,192,0.04)" stroke="#A8A8B0" stroke-width="3.5"/>
  <!-- Bridge (thin) -->
  <path d="M204 96 Q250 82 296 96" fill="none" stroke="#A8A8B0" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Nose pad wire left -->
  <line x1="214" y1="102" x2="224" y2="112" stroke="#A8A8B0" stroke-width="3" stroke-linecap="round"/>
  <!-- Nose pad wire right -->
  <line x1="286" y1="102" x2="276" y2="112" stroke="#A8A8B0" stroke-width="3" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="226" cy="115" rx="5" ry="3" fill="none" stroke="#A8A8B0" stroke-width="2.5"/>
  <ellipse cx="274" cy="115" rx="5" ry="3" fill="none" stroke="#A8A8B0" stroke-width="2.5"/>
  <!-- Left temple (thin) -->
  <line x1="16" y1="80" x2="-28" y2="72" stroke="#A8A8B0" stroke-width="4" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="484" y1="80" x2="528" y2="72" stroke="#A8A8B0" stroke-width="4" stroke-linecap="round"/>
</svg>`;

const WAYFARER_BLUE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
  <!-- Left wayfarer: slightly trapezoidal, wider at top -->
  <path d="M8,52 L210,48 L210,148 Q210,158 200,160 L18,162 Q6,162 6,150 Z"
        fill="rgba(0,80,180,0.08)" stroke="#1A4FCC" stroke-width="12" stroke-linejoin="round"/>
  <!-- Right wayfarer -->
  <path d="M492,52 L290,48 L290,148 Q290,158 300,160 L482,162 Q494,162 494,150 Z"
        fill="rgba(0,80,180,0.08)" stroke="#1A4FCC" stroke-width="12" stroke-linejoin="round"/>
  <!-- Bridge -->
  <path d="M210 90 C228 74 272 74 290 90" fill="none" stroke="#1A4FCC" stroke-width="9" stroke-linecap="round"/>
  <!-- Nose pads -->
  <ellipse cx="222" cy="98" rx="7" ry="4" fill="#1A4FCC"/>
  <ellipse cx="278" cy="98" rx="7" ry="4" fill="#1A4FCC"/>
  <!-- Left temple -->
  <line x1="8" y1="70" x2="-30" y2="62" stroke="#1A4FCC" stroke-width="11" stroke-linecap="round"/>
  <!-- Right temple -->
  <line x1="492" y1="70" x2="530" y2="62" stroke="#1A4FCC" stroke-width="11" stroke-linecap="round"/>
</svg>`;

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const GLASSES_COLLECTION: GlassesFrame[] = [
  {
    id: 'classic-black',
    name: 'Classic Black',
    brand: 'SpectaSnap Essentials',
    price: 149,
    color: '#111111',
    style: 'Rectangular',
    svg: svgToDataUri(CLASSIC_BLACK),
    scaleFactor: 1.05,
    yOffset: -0.05,
  },
  {
    id: 'tortoiseshell-round',
    name: 'Amber Tortoise',
    brand: 'SpectaSnap Heritage',
    price: 229,
    color: '#7B3F00',
    style: 'Round',
    svg: svgToDataUri(TORTOISESHELL_ROUND),
    scaleFactor: 1.1,
    yOffset: -0.05,
  },
  {
    id: 'aviator-gold',
    name: 'Aviator Gold',
    brand: 'SpectaSnap Air',
    price: 279,
    color: '#B8860B',
    style: 'Aviator',
    svg: svgToDataUri(AVIATOR_GOLD),
    scaleFactor: 1.0,
    yOffset: 0.1,
  },
  {
    id: 'cat-eye-red',
    name: 'Scarlet Cat-Eye',
    brand: 'SpectaSnap Couture',
    price: 319,
    color: '#C0002A',
    style: 'Cat-Eye',
    svg: svgToDataUri(CAT_EYE_RED),
    scaleFactor: 1.0,
    yOffset: -0.08,
  },
  {
    id: 'rimless-silver',
    name: 'Rimless Silver',
    brand: 'SpectaSnap Minimal',
    price: 189,
    color: '#A8A8B0',
    style: 'Rimless',
    svg: svgToDataUri(RIMLESS_SILVER),
    scaleFactor: 1.08,
    yOffset: -0.02,
  },
  {
    id: 'wayfarer-blue',
    name: 'Ocean Wayfarer',
    brand: 'SpectaSnap Neo',
    price: 199,
    color: '#1A4FCC',
    style: 'Wayfarer',
    svg: svgToDataUri(WAYFARER_BLUE),
    scaleFactor: 1.05,
    yOffset: -0.05,
  },
];
