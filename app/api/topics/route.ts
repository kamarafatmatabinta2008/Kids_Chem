import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')

  try {
    if (slug) {
      const topic = await prisma.topic.findUnique({
        where: { slug },
        include: {
          quiz: {
            include: {
              questions: true
            }
          }
        }
      })

      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
      }
      return NextResponse.json(topic)
    }

    const topics = await prisma.topic.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(topics)
  } catch (error: any) {
    console.error('Topics API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
