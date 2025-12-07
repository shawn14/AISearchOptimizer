import { NextRequest, NextResponse } from 'next/server'
import { getLatestMonitoringRun } from '@/lib/file-storage'

interface CitationData {
  url: string
  domain: string
  mentions: number
  platforms: string[]
  queries: string[]
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  first_seen: string
  last_seen: string
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

    // Get latest monitoring run
    const latestRun = await getLatestMonitoringRun(brandId)

    if (!latestRun || !latestRun.individual_results) {
      return NextResponse.json({
        citations: [],
        url_stats: [],
        total_citations: 0,
      })
    }

    // Extract all citations from individual results
    const allCitations: Array<{
      url: string
      platform: string
      query: string
      sentiment: 'positive' | 'neutral' | 'negative'
      mentioned: boolean
      timestamp: string
      context: string
      citationText: string
    }> = []

    latestRun.individual_results.forEach((result: any) => {
      if (result.citations && result.citations.length > 0) {
        result.citations.forEach((url: string) => {
          // Extract the sentence mentioning the URL for context
          const responseText = result.response_text || ''
          const sentences = responseText.split(/[.!?]+/)
          let citationText = ''

          // Find sentence containing brand mention for context
          for (const sentence of sentences) {
            if (sentence.toLowerCase().includes(latestRun.brand_name.toLowerCase())) {
              citationText = sentence.trim()
              break
            }
          }

          if (!citationText && sentences.length > 0) {
            citationText = sentences[0].trim()
          }

          allCitations.push({
            url,
            platform: result.platform,
            query: result.query,
            sentiment: result.sentiment || 'neutral',
            mentioned: result.mentioned || false,
            timestamp: latestRun.timestamp,
            context: result.context || '',
            citationText,
          })
        })
      }
    })

    // Aggregate citation data by URL
    const urlMap = new Map<string, CitationData>()

    allCitations.forEach(citation => {
      try {
        const urlObj = new URL(citation.url)
        const domain = urlObj.hostname

        if (!urlMap.has(citation.url)) {
          urlMap.set(citation.url, {
            url: citation.url,
            domain,
            mentions: 0,
            platforms: [],
            queries: [],
            sentiment: {
              positive: 0,
              neutral: 0,
              negative: 0,
            },
            first_seen: citation.timestamp,
            last_seen: citation.timestamp,
          })
        }

        const urlData = urlMap.get(citation.url)!
        urlData.mentions++

        if (!urlData.platforms.includes(citation.platform)) {
          urlData.platforms.push(citation.platform)
        }

        if (!urlData.queries.includes(citation.query)) {
          urlData.queries.push(citation.query)
        }

        urlData.sentiment[citation.sentiment]++

        if (new Date(citation.timestamp) < new Date(urlData.first_seen)) {
          urlData.first_seen = citation.timestamp
        }
        if (new Date(citation.timestamp) > new Date(urlData.last_seen)) {
          urlData.last_seen = citation.timestamp
        }
      } catch (e) {
        // Invalid URL, skip
        console.error('Invalid citation URL:', citation.url)
      }
    })

    // Convert to array and sort by mentions
    const url_stats = Array.from(urlMap.values())
      .sort((a, b) => b.mentions - a.mentions)

    return NextResponse.json({
      citations: allCitations,
      url_stats,
      total_citations: allCitations.length,
      unique_urls: url_stats.length,
    })
  } catch (error) {
    console.error('Error fetching citations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch citations' },
      { status: 500 }
    )
  }
}
