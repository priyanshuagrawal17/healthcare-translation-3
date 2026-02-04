import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const list = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to list conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title ?? 'New Conversation';
    const conv = await prisma.conversation.create({ data: { title } });
    return NextResponse.json(conv);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
