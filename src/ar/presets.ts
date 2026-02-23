export type FrameFamily = 'round' | 'rectangle' | 'aviator' | 'cat-eye' | 'sport-wrap';

export interface ProceduralPreset {
  id: string;
  name: string;
  family: FrameFamily;
  frameColor: string;
  lensTint: string;
  styleTag: string;
  style: string;
  bestFor: string[];
  occasions: string[];
  staffNote: string;
  lensWidth: number;
  lensHeight: number;
  rimThickness: number;
  frameDepth: number;
  bridgeWidth: number;
  templeLength: number;
  lensGap: number;
  browLift: number;
}

const SHAPES = [
  ['Oval', 'Round', 'Heart'],
  ['Square', 'Oval', 'Oblong'],
  ['Heart', 'Diamond', 'Oval'],
  ['Round', 'Square', 'Oval'],
  ['Oblong', 'Diamond', 'Square'],
] as const;

const OCCASION_SETS = [
  ['Casual', 'Office'],
  ['Office', 'Wedding'],
  ['Casual', 'Sports'],
  ['Casual', 'Wedding'],
  ['Office', 'Casual', 'Wedding'],
] as const;

const TAGS = ['CLASSIC', 'EDITORIAL', 'ICONIC', 'MODERN', 'MINIMAL'] as const;

const COLOR_SWATCHES = [
  '#1b1b1d',
  '#2f3e52',
  '#6a4d3c',
  '#3f2f3a',
  '#5b6b58',
  '#1e3f63',
  '#7a2f2f',
  '#6f5f44',
  '#3d505f',
  '#4b4b4b',
] as const;

const LENS_TINTS = [
  '#95a4b8',
  '#7d8fa2',
  '#9aa38f',
  '#8e8597',
  '#88a3ad',
  '#b09b85',
  '#8aa49a',
  '#9498ad',
  '#89a2bd',
  '#9f9f9f',
] as const;

function makePreset(
  family: FrameFamily,
  index: number,
  counts: { familyIndex: number; inFamilyIndex: number },
): ProceduralPreset {
  const c = COLOR_SWATCHES[index % COLOR_SWATCHES.length];
  const t = LENS_TINTS[(index + 3) % LENS_TINTS.length];
  const shape = SHAPES[index % SHAPES.length];
  const occasions = OCCASION_SETS[index % OCCASION_SETS.length];
  const tag = TAGS[index % TAGS.length];

  const n = counts.inFamilyIndex + 1;
  const id = `${family}-${String(n).padStart(2, '0')}`;

  let lensWidth = 0.065;
  let lensHeight = 0.046;
  let browLift = 0;
  let rimThickness = 0.007;
  let bridgeWidth = 0.018;
  let templeLength = 0.11;
  let lensGap = 0.018;
  let frameDepth = 0.008;

  if (family === 'round') {
    lensWidth = 0.058 + (n % 3) * 0.003;
    lensHeight = lensWidth * (0.92 + (n % 2) * 0.08);
    rimThickness = 0.006 + (n % 2) * 0.0012;
    bridgeWidth = 0.016 + (n % 3) * 0.001;
  } else if (family === 'rectangle') {
    lensWidth = 0.069 + (n % 4) * 0.002;
    lensHeight = 0.041 + (n % 3) * 0.002;
    rimThickness = 0.0065 + (n % 2) * 0.001;
    bridgeWidth = 0.017 + (n % 3) * 0.0015;
  } else if (family === 'aviator') {
    lensWidth = 0.066 + (n % 4) * 0.0015;
    lensHeight = 0.052 + (n % 3) * 0.002;
    browLift = 0.006 + (n % 2) * 0.0015;
    rimThickness = 0.0055 + (n % 2) * 0.001;
    bridgeWidth = 0.022 + (n % 2) * 0.001;
  } else if (family === 'cat-eye') {
    lensWidth = 0.064 + (n % 4) * 0.002;
    lensHeight = 0.043 + (n % 2) * 0.002;
    browLift = 0.011 + (n % 3) * 0.0015;
    rimThickness = 0.007 + (n % 2) * 0.001;
    templeLength = 0.114;
  } else if (family === 'sport-wrap') {
    lensWidth = 0.073 + (n % 2) * 0.002;
    lensHeight = 0.036 + (n % 3) * 0.0015;
    browLift = 0.004 + (n % 2) * 0.001;
    rimThickness = 0.006;
    bridgeWidth = 0.019;
    templeLength = 0.118;
    lensGap = 0.014;
    frameDepth = 0.009;
  }

  const title = `${family.replace('-', ' ')} ${String(n).padStart(2, '0')}`;
  const notePrefix =
    family === 'round' ? 'Soft curves'
      : family === 'rectangle' ? 'A structured front'
        : family === 'aviator' ? 'A teardrop-inspired profile'
          : family === 'cat-eye' ? 'An upswept silhouette'
            : 'A wrap-forward profile';

  return {
    id,
    name: title.replace(/\b\w/g, (x) => x.toUpperCase()),
    family,
    frameColor: c,
    lensTint: t,
    styleTag: tag,
    style: family === 'sport-wrap' ? 'Sport Wrap' : family.replace('-', ' ').replace(/\b\w/g, (x) => x.toUpperCase()),
    bestFor: [...shape],
    occasions: [...occasions],
    staffNote: `${notePrefix} with balanced proportions for easy daily wear.`,
    lensWidth,
    lensHeight,
    rimThickness,
    frameDepth,
    bridgeWidth,
    templeLength,
    lensGap,
    browLift,
  };
}

function familyPresets(family: FrameFamily, count: number, baseIndex: number): ProceduralPreset[] {
  return Array.from({ length: count }, (_, i) => makePreset(family, baseIndex + i, {
    familyIndex: baseIndex,
    inFamilyIndex: i,
  }));
}

export const PROCEDURAL_PRESETS: ProceduralPreset[] = [
  ...familyPresets('round', 10, 0),
  ...familyPresets('rectangle', 10, 10),
  ...familyPresets('aviator', 10, 20),
  ...familyPresets('cat-eye', 10, 30),
  ...familyPresets('sport-wrap', 5, 40),
];

export function getProceduralPreset(id: string): ProceduralPreset | undefined {
  return PROCEDURAL_PRESETS.find((preset) => preset.id === id);
}
