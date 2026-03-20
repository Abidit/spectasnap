import { PROCEDURAL_PRESETS, COLOR_VARIANTS, LENS_TINT_OPTIONS, type FrameFamily, type ColorVariant, type LensTint } from '@/ar/presets';

export type { ColorVariant, LensTint };
export { LENS_TINT_OPTIONS };

export interface GlassesFrame {
  id: string;
  name: string;
  color: string;
  style: string;
  styleTag: string;
  bestFor: string[];
  occasions: string[];
  staffNote: string;
  svg: string;
  scaleFactor: number;
  yOffset: number;
  colorVariants: ColorVariant[];
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function familyPreviewPath(family: FrameFamily): { left: string; right: string; viewBox: string } {
  if (family === 'round') {
    return {
      viewBox: '0 0 500 220',
      left: '<circle cx="112" cy="112" r="74"/>',
      right: '<circle cx="388" cy="112" r="74"/>',
    };
  }
  if (family === 'rectangle') {
    return {
      viewBox: '0 0 500 220',
      left: '<rect x="36" y="52" width="152" height="118" rx="26"/>',
      right: '<rect x="312" y="52" width="152" height="118" rx="26"/>',
    };
  }
  if (family === 'aviator') {
    return {
      viewBox: '0 0 500 240',
      left: '<path d="M28,62 Q18,168 98,206 Q160,224 206,162 Q228,126 214,62 Z"/>',
      right: '<path d="M472,62 Q482,168 402,206 Q340,224 294,162 Q272,126 286,62 Z"/>',
    };
  }
  if (family === 'cat-eye') {
    return {
      viewBox: '0 0 500 220',
      left: '<path d="M20,114 Q22,56 106,44 Q164,38 202,64 Q214,80 214,106 Q214,140 164,154 Q84,164 32,144 Z"/>',
      right: '<path d="M480,114 Q478,56 394,44 Q336,38 298,64 Q286,80 286,106 Q286,140 336,154 Q416,164 468,144 Z"/>',
    };
  }
  return {
    viewBox: '0 0 500 220',
    left: '<rect x="26" y="68" width="178" height="90" rx="38"/>',
    right: '<rect x="296" y="68" width="178" height="90" rx="38"/>',
  };
}

function buildPreviewSvg(frameColor: string, lensTint: string, family: FrameFamily): string {
  const p = familyPreviewPath(family);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${p.viewBox}">
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${lensTint}" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="${lensTint}" stop-opacity="0.38"/>
      </linearGradient>
    </defs>
    <g fill="url(#lg)">${p.left}${p.right}</g>
    <g fill="none" stroke="${frameColor}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      ${p.left}${p.right}
      <path d="M212 100 C230 82 270 82 288 100" />
      <line x1="24" y1="86" x2="-18" y2="76" />
      <line x1="476" y1="86" x2="518" y2="76" />
    </g>
  </svg>`;
  return svgToDataUri(svg);
}

const FEATURED_GLB_FRAMES: GlassesFrame[] = [
  {
    id: 'glb-aviator',
    name: 'Featured Aviator',
    color: '#c9a96e',
    style: 'Aviator',
    styleTag: 'FEATURED',
    bestFor: ['Oval', 'Heart', 'Diamond'],
    occasions: ['Casual', 'Office', 'Wedding'],
    staffNote: 'A lightweight metal profile that works from smart-casual to formal wear.',
    svg: buildPreviewSvg('#c9a96e', '#8f9bab', 'aviator'),
    scaleFactor: 1.0,
    yOffset: 0.08,
    colorVariants: COLOR_VARIANTS,
  },
  {
    id: 'glb-round-metal',
    name: 'Featured Round',
    color: '#7d8594',
    style: 'Round',
    styleTag: 'FEATURED',
    bestFor: ['Square', 'Oval', 'Oblong'],
    occasions: ['Office', 'Casual'],
    staffNote: 'Balanced circular rims that soften angular features.',
    svg: buildPreviewSvg('#7d8594', '#91a1b3', 'round'),
    scaleFactor: 1.05,
    yOffset: -0.03,
    colorVariants: COLOR_VARIANTS,
  },
  {
    id: 'glb-wayfarer',
    name: 'Featured Wayfarer',
    color: '#27364a',
    style: 'Rectangle',
    styleTag: 'FEATURED',
    bestFor: ['Round', 'Oval', 'Heart'],
    occasions: ['Casual', 'Office'],
    staffNote: 'A structured brow line for a confident everyday look.',
    svg: buildPreviewSvg('#27364a', '#8c98a8', 'rectangle'),
    scaleFactor: 1.06,
    yOffset: -0.04,
    colorVariants: COLOR_VARIANTS,
  },
  {
    id: 'glb-cat-eye',
    name: 'Featured Cat-Eye',
    color: '#613144',
    style: 'Cat-Eye',
    styleTag: 'FEATURED',
    bestFor: ['Heart', 'Oval', 'Square'],
    occasions: ['Casual', 'Wedding'],
    staffNote: 'An elegant upswept front that adds instant lift.',
    svg: buildPreviewSvg('#613144', '#9b8ca0', 'cat-eye'),
    scaleFactor: 1.0,
    yOffset: -0.05,
    colorVariants: COLOR_VARIANTS,
  },
  {
    id: 'glb-sport-wrap',
    name: 'Featured Wrap',
    color: '#245166',
    style: 'Sport Wrap',
    styleTag: 'FEATURED',
    bestFor: ['Oval', 'Round', 'Oblong'],
    occasions: ['Sports', 'Casual'],
    staffNote: 'A sporty silhouette with broad coverage for active use.',
    svg: buildPreviewSvg('#245166', '#87a6b2', 'sport-wrap'),
    scaleFactor: 1.08,
    yOffset: -0.02,
    colorVariants: COLOR_VARIANTS,
  },
];

const PROCEDURAL_FRAMES: GlassesFrame[] = PROCEDURAL_PRESETS.map((preset, idx) => ({
  id: preset.id,
  name: preset.name,
  color: preset.frameColor,
  style: preset.style,
  styleTag: preset.styleTag,
  bestFor: preset.bestFor,
  occasions: preset.occasions,
  staffNote: preset.staffNote,
  svg: buildPreviewSvg(preset.frameColor, preset.lensTint, preset.family),
  scaleFactor: 1 + (idx % 4) * 0.015,
  yOffset: -0.02 + (idx % 3) * 0.01,
  colorVariants: preset.colorVariants,
}));

export const GLASSES_COLLECTION: GlassesFrame[] = [
  ...FEATURED_GLB_FRAMES,
  ...PROCEDURAL_FRAMES,
];
