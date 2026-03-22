import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const client = new Anthropic();

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIRec {
  frameId: string;
  frameName: string;
  reason: string;
  confidence: 'Perfect match' | 'Great choice' | 'Worth trying';
}

interface StylistRequest {
  faceShape: string;
  answers: string[];
}

// ─── Fallback recs by face shape — never crash ────────────────────────────────

function getFallbackRecs(faceShape: string): AIRec[] {
  const map: Record<string, AIRec[]> = {
    Oval: [
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Balances your symmetrical oval shape perfectly', confidence: 'Perfect match' },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Softens and complements your even proportions', confidence: 'Great choice'   },
      { frameId: 'rectangle-01',      frameName: 'Rectangle 01',      reason: 'Adds structure to your versatile face shape',   confidence: 'Worth trying'  },
    ],
    Round: [
      { frameId: 'rectangle-01',      frameName: 'Rectangle 01',      reason: 'Angular lines elongate and define your face',   confidence: 'Perfect match' },
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Adds lift and definition to softer features',   confidence: 'Great choice'  },
      { frameId: 'featured-wayfarer', frameName: 'Featured Wayfarer', reason: 'Classic shape adds welcome contrast',           confidence: 'Worth trying'  },
    ],
    Square: [
      { frameId: 'featured-round',    frameName: 'Featured Round',    reason: 'Softens your strong angular jawline beautifully', confidence: 'Perfect match' },
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Curved brow bar balances your sharp features',    confidence: 'Great choice'  },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Rounds off strong angular proportions',           confidence: 'Worth trying'  },
    ],
    Heart: [
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Highlights your cheekbones and adds balance',     confidence: 'Perfect match' },
      { frameId: 'round-01',          frameName: 'Round 01',          reason: 'Balances a wider forehead with soft curves',      confidence: 'Great choice'  },
      { frameId: 'featured-aviator',  frameName: 'Featured Aviator',  reason: 'Adds width at jaw to balance your forehead',      confidence: 'Worth trying'  },
    ],
    Oblong: [
      { frameId: 'featured-wayfarer', frameName: 'Featured Wayfarer', reason: 'Adds width and proportion to your longer face',   confidence: 'Perfect match' },
      { frameId: 'featured-round',    frameName: 'Featured Round',    reason: 'Wide frames break up a longer face shape',        confidence: 'Great choice'  },
      { frameId: 'cat-eye-01',        frameName: 'Cat-Eye 01',        reason: 'Horizontal emphasis creates pleasing proportion', confidence: 'Worth trying'  },
    ],
  };
  return map[faceShape] ?? map['Oval'];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = (await req.json()) as StylistRequest;
  const { faceShape, answers } = body;

  // If API key not set, return fallback silently
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(getFallbackRecs(faceShape ?? 'Oval'));
  }

  const system = `You are SpectaSnap's AI stylist.
Recommend exactly 3 frames based on face shape and lifestyle answers.

Available frames: Classic Black, Amber Tortoise, Aviator Gold, Scarlet Cat-Eye,
Rimless Silver, Ocean Wayfarer, Round/Rectangle/Aviator/Cat-Eye/Wrap 01-10.

Return ONLY valid JSON array, no markdown:
[{"frameId":"<id>","frameName":"<name>","reason":"<max 12 words>","confidence":"Perfect match"|"Great choice"|"Worth trying"}]`;

  const userMsg = `Face shape: ${faceShape ?? 'Unknown'}
Answers: ${(answers ?? []).map((a: string, i: number) => `Q${i + 1}: ${a}`).join(', ')}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as AIRec[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Empty or non-array response');
    }

    return NextResponse.json(parsed.slice(0, 3));
  } catch {
    // Always fall back — never let the AI Stylist fail visibly
    return NextResponse.json(getFallbackRecs(faceShape ?? 'Oval'));
  }
}
