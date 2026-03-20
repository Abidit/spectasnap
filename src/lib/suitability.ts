// ---------------------------------------------------------------------------
// Suitability scoring engine
// Maps frame style x face shape to a 0-100 score with a human-readable reason.
// ---------------------------------------------------------------------------

export interface SuitabilityResult {
  score: number; // 0-100
  reason: string; // "Round frames soften angular features"
  verdict: 'excellent' | 'good' | 'fair'; // 80+ = excellent, 60-79 = good, <60 = fair
}

// ---- Scoring matrix (frame style x face shape -> base score) ---------------
// Keys are normalised family names (lowercase, hyphenated).
// Face shapes are lowercase.
type FamilyKey = 'round' | 'rectangle' | 'aviator' | 'cat-eye' | 'sport-wrap';
type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong';

const SCORE_MATRIX: Record<FamilyKey, Record<FaceShape, number>> = {
  round:        { oval: 85, round: 45, square: 92, heart: 78, oblong: 70 },
  rectangle:    { oval: 88, round: 90, square: 55, heart: 72, oblong: 80 },
  aviator:      { oval: 90, round: 75, square: 80, heart: 88, oblong: 65 },
  'cat-eye':    { oval: 82, round: 85, square: 78, heart: 92, oblong: 72 },
  'sport-wrap': { oval: 75, round: 68, square: 70, heart: 65, oblong: 85 },
};

// ---- Reason templates (keyed by "family|shape") ----------------------------
const REASON_MAP: Record<string, string> = {
  'round|square':      'Curved lines soften a strong jawline',
  'round|round':       'Similar shapes may overemphasize roundness \u2014 try angular frames',
  'round|oval':        'A timeless shape that plays well with balanced proportions',
  'round|heart':       'Soft curves complement a narrower chin',
  'round|oblong':      'Circular frames can help break up a longer face',
  'rectangle|round':   'Angular frames add definition to softer curves',
  'rectangle|square':  'Matching angles can feel too rigid \u2014 try softer shapes',
  'rectangle|oval':    'Clean horizontals pair naturally with an oval profile',
  'rectangle|heart':   'A solid brow line echoes forehead width evenly',
  'rectangle|oblong':  'Wide rectangles visually shorten a longer face',
  'aviator|oval':      'A versatile classic that complements balanced proportions',
  'aviator|heart':     'The wider bottom balances a broader forehead',
  'aviator|round':     'Teardrop depth adds vertical contrast to round features',
  'aviator|square':    'The curved drop softens a strong jaw',
  'aviator|oblong':    'Aviators can elongate \u2014 choose deeper lenses for balance',
  'cat-eye|heart':     'Upswept corners echo your natural cheekbone line',
  'cat-eye|round':     'The angular uplift adds definition',
  'cat-eye|oval':      'Dramatic accents pair beautifully with an even face shape',
  'cat-eye|square':    'The upswept line draws the eye away from a wide jaw',
  'cat-eye|oblong':    'Cat-eye width helps balance a longer face',
  'sport-wrap|oblong': 'Wraparound width visually shortens a longer face',
  'sport-wrap|oval':   'A sporty look that works with balanced features',
  'sport-wrap|round':  'Wrap coverage adds structure to round features',
  'sport-wrap|square': 'Bold wrap lines can compete with a strong jaw',
  'sport-wrap|heart':  'Wide wraps may overpower a narrower chin',
};

const DEFAULT_FAIR_REASON = 'This style works, but other shapes may flatter more';
const DEFAULT_NEUTRAL_REASON = 'A solid everyday option for most face shapes';

// ---- Helpers ---------------------------------------------------------------

/** Normalise a frame style string to its family key. */
function toFamily(frameStyle: string): FamilyKey | null {
  const key = frameStyle.toLowerCase().replace(/\s+/g, '-') as FamilyKey;
  if (key in SCORE_MATRIX) return key;
  return null;
}

function toFaceShape(shape: string): FaceShape | null {
  const normalised = shape.toLowerCase() as FaceShape;
  if (['oval', 'round', 'square', 'heart', 'oblong'].includes(normalised))
    return normalised;
  return null;
}

function verdictFromScore(score: number): 'excellent' | 'good' | 'fair' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'fair';
}

// ---- Public API ------------------------------------------------------------

/**
 * Compute suitability of a specific frame style for a given face shape.
 */
export function computeSuitability(
  frameStyle: string,
  faceShape: string,
): SuitabilityResult {
  const family = toFamily(frameStyle);
  const shape = toFaceShape(faceShape);

  // If either is unrecognised, return neutral score
  if (!family || !shape) {
    return { score: 80, reason: DEFAULT_NEUTRAL_REASON, verdict: 'excellent' };
  }

  const score = SCORE_MATRIX[family][shape];
  const verdict = verdictFromScore(score);
  const reason =
    REASON_MAP[`${family}|${shape}`] ??
    (verdict === 'fair' ? DEFAULT_FAIR_REASON : DEFAULT_NEUTRAL_REASON);

  return { score, reason, verdict };
}

/**
 * Return the top N frames from a collection sorted by suitability for a face shape.
 */
export function getTopRecommendations(
  frames: Array<{ id: string; style: string; name?: string }>,
  faceShape: string,
  count: number = 3,
): Array<{ frameId: string; score: number; reason: string }> {
  const scored = frames.map((f) => {
    const result = computeSuitability(f.style, faceShape);
    return { frameId: f.id, score: result.score, reason: result.reason };
  });

  // Sort descending by score, stable
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}
