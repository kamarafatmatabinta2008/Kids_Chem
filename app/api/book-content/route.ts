import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

const BOOK_SUBJECT_MAP: Record<number, string> = {
  1: 'BIOLOGY', 2: 'CHEMISTRY', 3: 'PHYSICS',
  4: 'BIOLOGY', 5: 'CHEMISTRY', 6: 'PHYSICS',
  7: 'BIOLOGY', 8: 'CHEMISTRY', 9: 'PHYSICS'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')

  if (!bookId) {
    return NextResponse.json({ error: 'bookId required' }, { status: 400 })
  }

  const subject = BOOK_SUBJECT_MAP[Number(bookId)]
  if (!subject) {
    return NextResponse.json({ error: 'Unknown book' }, { status: 404 })
  }

  try {
    const topics = await prisma.topic.findMany({
      where: { subject: subject as any },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, title: true, slug: true,
        rawTextbookExcerpt: true, simplified150Story: true,
        textbookSource: true, subject: true
      }
    })

    return NextResponse.json({ subject, topics, count: topics.length })
  } catch (err: any) {
    console.error('book-content error:', err)
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 })
  }
}
