import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, sourceLang = 'en' } = await req.json();
    if (!text || !targetLang) {
      return NextResponse.json({ error: 'text and targetLang required' }, { status: 400 });
    }
    const translated = await translateText(text, targetLang, sourceLang);
    return NextResponse.json({ translated });
  } catch (e) {
    console.error('Translate error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Translation failed' },
      { status: 500 }
    );
  }
}
