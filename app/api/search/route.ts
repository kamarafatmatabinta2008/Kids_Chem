import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await prisma.topic.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { simplified150Story: { contains: q, mode: 'insensitive' } },
          { rawTextbookExcerpt: { contains: q, mode: 'insensitive' } },
          { subject: q.toUpperCase() as any }
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subject: true,
        simplified150Story: true,
        textbookSource: true
      },
      take: 10,
      orderBy: { sortOrder: 'asc' }
    })

    const totalCount = await prisma.topic.count({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { simplified150Story: { contains: q, mode: 'insensitive' } },
          { rawTextbookExcerpt: { contains: q, mode: 'insensitive' } }
        ]
      }
    })

    return NextResponse.json({ results, totalCount })
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
