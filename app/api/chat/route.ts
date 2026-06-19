import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { chatWithSciBuddy } from '@/src/lib/ai'

export async function POST(request: Request) {
  try {
    const { message, topicId, history } = await request.json()

    let context = 'No additional context found.'
    let sources: any[] = []

    // If a topicId is provided, fetch textbook context directly from the DB
    if (topicId) {
      try {
        const topic = await prisma.topic.findUnique({
          where: { id: topicId },
          select: { title: true, rawTextbookExcerpt: true, simplified150Story: true, subject: true }
        })

        if (topic) {
          context = `Subject: ${topic.subject}\nTitle: ${topic.title}\n\nTextbook:\n${topic.rawTextbookExcerpt}\n\nSimplified:\n${topic.simplified150Story}`
          sources = [
            { content: topic.rawTextbookExcerpt.substring(0, 200), source: 'Textbook' },
            { content: topic.simplified150Story.substring(0, 200), source: 'Simplified' }
          ]
        }
      } catch { /* topic context unavailable, fall back to general chat */ }
    }

    const aiResponse = await chatWithSciBuddy(message, context, history)

    return NextResponse.json({ 
      content: aiResponse,
      sources
    })
  } catch (error: any) {
    console.error('Sci-Buddy Error:', error)
    return NextResponse.json({ error: error.message || 'Sci-Buddy is taking a nap. Please try again later!' }, { status: 500 })
  }
}
