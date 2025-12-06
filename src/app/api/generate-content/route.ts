import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, contentType } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

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

    console.log('Content generated successfully')

    return NextResponse.json({
      success: true,
      content,
      wordCount: content?.split(' ').length || 0,
      cost: (completion.usage?.total_tokens || 0) * 0.000002 // Rough cost estimate
    })

  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Content generation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
