import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ error: 'Query q required' }, { status: 400 });
  try {
    const conversations = await prisma.conversation.findMany({
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    const lowerQ = q.toLowerCase();
    const results: { conversationId: string; conversationTitle: string; matches: { messageId: string; role: string; originalText: string; translatedText: string; createdAt: string; contextBefore?: string; contextAfter?: string }[] }[] = [];

    for (const conv of conversations) {
      const matches: { messageId: string; role: string; originalText: string; translatedText: string; createdAt: string; contextBefore?: string; contextAfter?: string }[] = [];
      const texts = conv.messages.map((m) => ({ id: m.id, role: m.role, original: m.originalText, translated: m.translatedText, createdAt: m.createdAt.toISOString() }));

      for (let i = 0; i < texts.length; i++) {
        const m = texts[i];
        const combined = `${m.original} ${m.translated}`.toLowerCase();
        if (!combined.includes(lowerQ)) continue;
        const contextBefore = texts[i - 1] ? `${texts[i - 1].role}: ${texts[i - 1].original}` : undefined;
        const contextAfter = texts[i + 1] ? `${texts[i + 1].role}: ${texts[i + 1].original}` : undefined;
        matches.push({
          messageId: m.id,
          role: m.role,
          originalText: m.original,
          translatedText: m.translated,
          createdAt: m.createdAt,
          contextBefore,
          contextAfter,
        });
      }
      if (matches.length) results.push({ conversationId: conv.id, conversationTitle: conv.title, matches });
    }

    return NextResponse.json({ results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
