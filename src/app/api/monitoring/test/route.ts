import { NextResponse } from 'next/server'
import { queryAllPlatforms, analyzeBrandMention, calculateSentiment } from '@/lib/ai-clients'

/**
 * Test API endpoint to demonstrate AI monitoring functionality
 * POST /api/monitoring/test
 *
 * Body: {
 *   query: string,
 *   brandName: string,
 *   brandDomain?: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, brandName, brandDomain } = body

    if (!query || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: query and brandName' },
        { status: 400 }
      )
    }

    console.log(`Testing monitoring for brand: ${brandName}`)
    console.log(`Query: ${query}`)

    // Query all AI platforms in parallel
    const responses = await queryAllPlatforms(query)

    // Analyze each response for brand mentions
    const results = responses.map(response => {
      const mentionAnalysis = analyzeBrandMention(
        response.text,
        brandName,
        brandDomain
      )

      const sentimentAnalysis = mentionAnalysis.mentioned
        ? calculateSentiment(mentionAnalysis.context_snippet || response.text)
        : null

      return {
        platform: response.platform,
        model: response.metadata.model,
        responseText: response.text,
        cost: response.metadata.cost,
        tokens: response.metadata.tokens,
        responseTime: response.metadata.responseTime,
        citations: response.citations,
        brandMention: {
          ...mentionAnalysis,
          sentiment: sentimentAnalysis?.sentiment,
          sentimentScore: sentimentAnalysis?.score,
        },
      }
    })

    // Calculate summary statistics
    const totalMentions = results.filter(r => r.brandMention.mentioned).length
    const avgProminence = results
      .filter(r => r.brandMention.prominence_score)
      .reduce((sum, r) => sum + (r.brandMention.prominence_score || 0), 0) /
      totalMentions || 0

    const totalCost = results.reduce((sum, r) => sum + r.cost, 0)
    const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0)

    return NextResponse.json({
      success: true,
      query,
      brandName,
      summary: {
        totalPlatforms: responses.length,
        totalMentions,
        mentionRate: (totalMentions / responses.length) * 100,
        avgProminenceScore: avgProminence,
        totalCost,
        totalTokens,
      },
      results,
    })
  } catch (error: any) {
    console.error('Monitoring test error:', error)
    return NextResponse.json(
      { error: 'Failed to execute monitoring test', message: error.message },
      { status: 500 }
    )
  }
}
