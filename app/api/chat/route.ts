import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase-server'
import { generateEmbedding, chatWithSciBuddy } from '@/src/lib/ai'

export async function POST(request: Request) {
  try {
    const { message, topicId, history } = await request.json()
    const supabase = createClient()

    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(message)

    // 2. Search for relevant context
    const { data: contextMatches, error: searchError } = await supabase.rpc('match_topic_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
      p_topic_id: topicId
    })

    if (searchError) throw searchError

    const context = contextMatches?.map((m: any) => m.content).join('\n\n') || 'No additional context found.'

    // 3. Get AI response
    const aiResponse = await chatWithSciBuddy(message, context, history)

    // 4. Extract citations for the UI
    const sources = contextMatches?.map((m: any) => ({
      content: m.content,
      source: m.metadata?.source || 'Textbook',
      page: m.metadata?.page
    })) || []

    return NextResponse.json({ 
      content: aiResponse,
      sources
    })
  } catch (error) {
    console.error('Sci-Buddy Error:', error)
    return NextResponse.json({ error: 'Sci-Buddy is taking a nap. Please try again later!' }, { status: 500 })
  }
}
