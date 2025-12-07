import { NextRequest, NextResponse } from 'next/server'
import { getCompetitors, getLatestMonitoringRun } from '@/lib/file-storage'

interface QueryResult {
  query: string
  platform: string
  you: {
    mentioned: boolean
    prominence: number
    sentiment: 'positive' | 'neutral' | 'negative'
    position?: number
    context: string
  }
  competitors: {
    [competitorName: string]: {
      mentioned: boolean
      prominence: number
      sentiment: 'positive' | 'neutral' | 'negative'
      position?: number
      context: string
    }
  }
  winner: string | null
}

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

  if (position === 1) prominence += 40
  else if (position === 2) prominence += 30
  else if (position === 3) prominence += 20
  else prominence += 10

  // Check for positive/negative indicators
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

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  if (sentimentScore > 15) sentiment = 'positive'
  else if (sentimentScore < -15) sentiment = 'negative'

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

    // Get competitors and monitoring data
    const competitors = await getCompetitors(brandId)
    const latestRun = await getLatestMonitoringRun(brandId)

    if (!latestRun || !latestRun.individual_results) {
      return NextResponse.json({
        query_results: [],
        losing_queries: [],
        winning_queries: [],
      })
    }

    const yourBrand = latestRun.brand_name

    // Group results by query and platform
    const queryMap = new Map<string, QueryResult[]>()

    latestRun.individual_results.forEach((result: any) => {
      const key = `${result.query}|${result.platform}`

      // Analyze your brand
      const yourAnalysis = analyzeBrandMention(yourBrand, result.response_text)

      // Analyze each competitor
      const competitorAnalyses: { [key: string]: any } = {}
      competitors.forEach(competitor => {
        const analysis = analyzeBrandMention(competitor.name, result.response_text)
        competitorAnalyses[competitor.name] = {
          mentioned: analysis.mentioned,
          prominence: analysis.prominence_score,
          sentiment: analysis.sentiment,
          position: analysis.position,
          context: analysis.context,
        }
      })

      // Determine winner
      let winner: string | null = null
      let maxProminence = yourAnalysis.prominence_score

      if (yourAnalysis.mentioned) {
        winner = 'You'
      }

      Object.entries(competitorAnalyses).forEach(([name, analysis]: [string, any]) => {
        if (analysis.mentioned && analysis.prominence > maxProminence) {
          winner = name
          maxProminence = analysis.prominence
        }
      })

      const queryResult: QueryResult = {
        query: result.query,
        platform: result.platform,
        you: {
          mentioned: yourAnalysis.mentioned,
          prominence: yourAnalysis.prominence_score,
          sentiment: yourAnalysis.sentiment,
          position: yourAnalysis.position,
          context: yourAnalysis.context,
        },
        competitors: competitorAnalyses,
        winner,
      }

      if (!queryMap.has(result.query)) {
        queryMap.set(result.query, [])
      }
      queryMap.get(result.query)!.push(queryResult)
    })

    // Convert to array
    const allResults: QueryResult[] = []
    queryMap.forEach(results => {
      allResults.push(...results)
    })

    // Identify losing and winning queries
    const losingQueries = allResults.filter(r => r.winner && r.winner !== 'You')
    const winningQueries = allResults.filter(r => r.winner === 'You')

    // Group losing queries by competitor
    const losingByCompetitor: { [competitor: string]: QueryResult[] } = {}
    losingQueries.forEach(q => {
      if (q.winner) {
        if (!losingByCompetitor[q.winner]) {
          losingByCompetitor[q.winner] = []
        }
        losingByCompetitor[q.winner].push(q)
      }
    })

    return NextResponse.json({
      query_results: allResults,
      losing_queries: losingQueries,
      winning_queries: winningQueries,
      losing_by_competitor: losingByCompetitor,
      total_queries: allResults.length,
      win_rate: allResults.length > 0 ? Math.round((winningQueries.length / allResults.length) * 100) : 0,
    })
  } catch (error) {
    console.error('Error analyzing queries:', error)
    return NextResponse.json(
      { error: 'Failed to analyze queries' },
      { status: 500 }
    )
  }
}
