import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit, recordRequest, completeRequest, getUsageStats } from '@/lib/rate-limiting'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  // Get user ID (in production, get from auth)
  const userId = request.headers.get('x-user-id') || 'anonymous'

  try {
    const body = await request.json()
    const { topic, contentType } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Check rate limits
    const rateLimitCheck = checkRateLimit(userId, 'generate-content')
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
          usage: getUsageStats(userId),
        },
        {
          status: 429,
          headers: rateLimitCheck.retryAfter
            ? { 'Retry-After': rateLimitCheck.retryAfter.toString() }
            : {}
        }
      )
    }

    // Record request start
    recordRequest(userId, 'generate-content')

    console.log(`Generating ${contentType} about: ${topic}`)

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert content writer specializing in SEO and AEO (AI Engine Optimization). Create high-quality, engaging ${contentType}s that are optimized for both search engines and AI platforms like ChatGPT, Claude, and Perplexity.

Your content should:
- Be well-structured with clear headings
- Include relevant examples and actionable advice
- Be optimized for AI search engines
- Include natural question-answer patterns
- Be comprehensive and authoritative
- Use semantic HTML structure when applicable`
        },
        {
          role: 'user',
          content: `Write a comprehensive ${contentType} about: ${topic}

Format the content in Markdown with:
- A compelling title
- Clear H2 and H3 headings
- Bullet points and numbered lists where appropriate
- Practical examples
- A conclusion with key takeaways

Make it around 1200-1500 words and highly valuable for readers.`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const content = completion.choices[0].message.content
    const cost = (completion.usage?.total_tokens || 0) * 0.000002 // Rough cost estimate

    console.log('Content generated successfully')

    // Record the cost for rate limiting
    recordRequest(userId, 'generate-content', cost)

    // Mark request as complete
    completeRequest(userId)

    // Include usage stats in response
    const usageStats = getUsageStats(userId)

    return NextResponse.json({
      success: true,
      content,
      wordCount: content?.split(' ').length || 0,
      cost,
      usage: usageStats
    })

  } catch (error) {
    console.error('Content generation error:', error)
    completeRequest(userId)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Content generation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
