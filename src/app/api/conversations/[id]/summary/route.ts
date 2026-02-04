import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMedicalSummary } from '@/lib/openai';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const summary = await generateMedicalSummary(
      conv.messages.map((m) => ({
        role: m.role,
        originalText: m.originalText,
        translatedText: m.translatedText,
      }))
    );
    await prisma.conversation.update({
      where: { id },
      data: { summary },
    });
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Summary failed' },
      { status: 500 }
    );
  }
}
