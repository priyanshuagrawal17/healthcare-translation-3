import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;
  try {
    const body = await req.json();
    const { role, originalText, translatedText, sourceLang, targetLang, audioBlob, audioDuration } = body;
    if (!role || (!originalText && !audioBlob)) {
      return NextResponse.json({ error: 'role and (originalText or audioBlob) required' }, { status: 400 });
    }
    const msg = await prisma.message.create({
      data: {
        conversationId,
        role,
        originalText: originalText ?? '',
        translatedText: translatedText ?? '',
        sourceLang: sourceLang ?? 'en',
        targetLang: targetLang ?? 'en',
        audioBlob: audioBlob ?? null,
        audioDuration: audioDuration ?? null,
      },
    });
    return NextResponse.json(msg);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 });
  }
}
