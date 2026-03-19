import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const client = new Anthropic();

interface FrameOption {
  id: string;
  name: string;
  style: string;
  bestFor: string[];
}

interface StylistRequest {
  occasion: string;
  faceShape: string;
  style: string;
  material: string;
  avoidColors: string;
  availableFrames: FrameOption[];
}

interface StylistResponse {
  frameId: string;
  frameName: string;
  rationale: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment' }, { status: 500 });
  }

  const body = (await req.json()) as StylistRequest;
  const { occasion, faceShape, style, material, avoidColors, availableFrames } = body;

  const frameList = availableFrames
    .map((f) => `- id:"${f.id}" name:"${f.name}" style:"${f.style}" bestFor:[${f.bestFor.join(',')}]`)
    .join('\n');

  const prompt = `You are a luxury eyewear stylist. Based on the customer's answers, recommend exactly ONE frame from the list.

Customer profile:
- Occasion: ${occasion}
- Face shape: ${faceShape}
- Preferred style: ${style}
- Frame material preference: ${material}
- Colors to avoid: ${avoidColors || 'None'}

Available frames:
${frameList}

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{"frameId":"<id>","frameName":"<name>","rationale":"<2-3 sentence recommendation explaining why this frame suits them>"}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const parsed = JSON.parse(text) as StylistResponse;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: `AI returned unparseable response: ${text.slice(0, 200)}` }, { status: 500 });
  }
}
