import { NextRequest, NextResponse } from 'next/server'
import { getCompetitors } from '@/lib/file-storage'
import { getLatestMonitoringRun } from '@/lib/file-storage'

// Analyze brand mention in response text
function analyzeBrandMention(brandName: string, responseText: string): {
  mentioned: boolean
  prominence_score: number
  sentiment: 'positive' | 'neutral' | 'negative'
  context: string
  position?: number
} {
  const lowerResponse = responseText.toLowerCase()
  const lowerBrand = brandName.toLowerCase()

  // Check if mentioned
  const mentioned = lowerResponse.includes(lowerBrand)

  if (!mentioned) {
    return {
      mentioned: false,
      prominence_score: 0,
      sentiment: 'neutral',
      context: '',
    }
  }

  // Find position (which sentence)
  const sentences = responseText.split(/[.!?]+/)
  let position = 0
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].toLowerCase().includes(lowerBrand)) {
      position = i + 1
      break
    }
  }

  // Calculate prominence score
  let prominence = 0

  // Earlier mention = higher score
  if (position === 1) prominence += 40
  else if (position === 2) prominence += 30
  else if (position === 3) prominence += 20
  else prominence += 10

  // Check for positive indicators
  const positiveWords = ['best', 'top', 'leading', 'excellent', 'great', 'recommended', 'popular', 'trusted', 'reliable']
  const negativeWords = ['alternative', 'however', 'but', 'unfortunately', 'lacking', 'limited', 'expensive']

  const contextWindow = 200
  const brandIndex = lowerResponse.indexOf(lowerBrand)
  const context = responseText.substring(
    Math.max(0, brandIndex - contextWindow),
    Math.min(responseText.length, brandIndex + lowerBrand.length + contextWindow)
  )
  const lowerContext = context.toLowerCase()

  let sentimentScore = 0
  positiveWords.forEach(word => {
    if (lowerContext.includes(word)) {
      sentimentScore += 10
      prominence += 10
    }
  })
  negativeWords.forEach(word => {
    if (lowerContext.includes(word)) {
      sentimentScore -= 10
      prominence -= 5
    }
  })

  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (sentimentScore > 15) sentiment = 'positive'
  else if (sentimentScore < -15) sentiment = 'negative'

  // Cap prominence at 100
  prominence = Math.max(0, Math.min(100, prominence))

  return {
    mentioned,
    prominence_score: prominence,
    sentiment,
    context,
    position,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')

    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    // Get competitors for this brand
    const competitors = await getCompetitors(brandId)

    // Get latest monitoring run for this brand
    const latestRun = await getLatestMonitoringRun(brandId)

    if (!latestRun || !latestRun.individual_results) {
      return NextResponse.json({
        competitors: competitors.map(comp => ({
          id: comp.id,
          name: comp.name,
          visibility_score: 0,
          total_mentions: 0,
          queries_tested: 0,
          avg_sentiment: 0,
          trend: 'stable' as const,
        }))
      })
    }

    // Analyze each competitor's presence in the monitoring results
    const competitorStats = competitors.map(competitor => {
      let totalMentions = 0
      let totalProminence = 0
      let totalSentiment = 0
      const queriesTested = latestRun.queries_tested

      // Check each query result for this competitor
      latestRun.individual_results.forEach((result: any) => {
        const analysis = analyzeBrandMention(competitor.name, result.response_text)

        if (analysis.mentioned) {
          totalMentions++
          totalProminence += analysis.prominence_score

          // Convert sentiment to number
          if (analysis.sentiment === 'positive') totalSentiment += 1
          else if (analysis.sentiment === 'negative') totalSentiment -= 1
        }
      })

      const avgProminence = totalMentions > 0 ? Math.round(totalProminence / totalMentions) : 0
      const avgSentiment = totalMentions > 0 ? (totalSentiment / totalMentions + 1) / 2 : 0.5 // Normalize to 0-1

      return {
        id: competitor.id,
        name: competitor.name,
        visibility_score: avgProminence,
        total_mentions: totalMentions,
        queries_tested: queriesTested,
        avg_sentiment: avgSentiment,
        trend: totalMentions > 0 ? 'up' as const : 'stable' as const,
      }
    })

    return NextResponse.json({ competitors: competitorStats })
  } catch (error) {
    console.error('Error fetching competitor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor stats' },
      { status: 500 }
    )
  }
}
