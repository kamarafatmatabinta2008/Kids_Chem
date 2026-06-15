import OpenAI from 'openai'

function getCerebrasClient() {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) return null
  
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.cerebras.ai/v1',
  })
}

export async function generateEmbedding(text: string) {
  // Using Hugging Face Inference API for free, high-quality embeddings
  // This avoids local binary issues and keeps the build clean
  const hfToken = process.env.HUGGINGFACE_API_KEY
  
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      headers: { Authorization: `Bearer ${hfToken}` },
      method: "POST",
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
    }
  );

  if (!response.ok) {
    throw new Error(`HF Embedding Error: ${response.statusText}`);
  }

  const result = await response.json();
  return result as number[];
}

export async function chatWithSciBuddy(
  message: string,
  context: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const client = getCerebrasClient()
  if (!client) throw new Error('Cerebras API Key missing')

  const systemPrompt = `
    You are Sci-Buddy, a friendly and helpful AI science tutor for kids aged 8-15.
    Your goal is to explain science concepts simply, clearly, and safely.
    
    GUIDELINES:
    1. Ground your answers ONLY in the provided textbook context.
    2. If the answer is not in the context, say "I'm not sure about that yet, but I'm learning more every day! Let's focus on what we're studying now."
    3. Use simple analogies (e.g., comparing atoms to LEGO bricks).
    4. Keep responses concise (2-4 sentences).
    5. NEVER provide medical advice or discuss sensitive adult topics.
    6. If a user asks something off-topic or inappropriate, politely steer them back to science.
    
    TEXTBOOK CONTEXT:
    ${context}
  `

  const response = await client.chat.completions.create({
    model: 'llama3.1-8b', // Fast and reliable on Cerebras
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  return response.choices[0].message.content
}
