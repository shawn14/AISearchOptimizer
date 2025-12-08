import { queryOpenAI } from '../ai-clients/openai'
import { queryClaude } from '../ai-clients/anthropic'
import { queryGemini } from '../ai-clients/gemini'
import { queryPerplexity } from '../ai-clients/perplexity'
import { queryGrok } from '../ai-clients/grok'
import { AIClientResponse, AIPlatform } from '@/types'

export interface BrandMentionResult {
  platform: string
  query: string
  mentioned: boolean
  prominence_score: number // 0-100
  sentiment: 'positive' | 'neutral' | 'negative'
  context: string
  response_text: string
  position?: number // Position in response (1-based)
  cost: number
  citations?: string[] // URLs cited in the response
}

export interface MonitoringResult {
  brand_name: string
  total_mentions: number
  visibility_score: number
  queries_tested: number
  platform_results: {
    platform: string
    mentions: number
    avg_prominence: number
    avg_sentiment_score: number
  }[]
  individual_results: BrandMentionResult[]
  total_cost: number
  timestamp: string
}

// Platform configuration - enable/disable platforms
const ENABLED_PLATFORMS: AIPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity', 'grok']

// Generate industry-specific queries for a brand
function generateQueriesForBrand(brandName: string, industry?: string | null): string[] {
  const baseQueries = [
    `What are the best ${industry || 'companies'} for ${industry ? industry + ' services' : 'this industry'}?`,
    `Can you recommend top ${industry || 'solutions'} providers?`,
    `What ${industry || 'tools'} should I consider?`,
    `Who are the leading ${industry || 'companies'} in the market?`,
    `What are alternatives to ${brandName}?`,
  ]

  return baseQueries
}

// Analyze if and how a brand is mentioned in AI response
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

  // Find position (which paragraph/sentence)
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

  const contextWindow = 200 // Characters around brand mention
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

// Query a specific platform
async function queryPlatform(
  platform: AIPlatform,
  query: string,
  brandName: string
): Promise<BrandMentionResult> {
  let response: AIClientResponse

  try {
    switch (platform) {
      case 'chatgpt':
        response = await queryOpenAI(query, 'gpt-4o-mini')
        break
      case 'claude':
        response = await queryClaude(query, 'claude-3-haiku-20240307')
        break
      case 'gemini':
        response = await queryGemini(query, 'gemini-1.5-flash')
        break
      case 'perplexity':
        response = await queryPerplexity(query, 'sonar')
        break
      case 'grok':
        response = await queryGrok(query, 'grok-2-1212')
        break
      default:
        throw new Error(`Unknown platform: ${platform}`)
    }

    // Analyze brand mention
    const analysis = analyzeBrandMention(brandName, response.text)

    return {
      platform: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize platform name
      query,
      response_text: response.text,
      cost: response.metadata.cost,
      citations: response.citations || [],
      ...analysis,
    }
  } catch (error) {
    console.error(`Error querying ${platform}:`, error)
    // Return empty result on error
    return {
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      query,
      response_text: '',
      cost: 0,
      mentioned: false,
      prominence_score: 0,
      sentiment: 'neutral',
      context: '',
    }
  }
}

// Monitor a brand with custom queries
export async function monitorBrandWithCustomQueries(
  brandName: string,
  customQueries: string[],
  platforms: AIPlatform[] = ENABLED_PLATFORMS
): Promise<MonitoringResult> {
  const queries = customQueries

  console.log(`Monitoring brand "${brandName}" across ${platforms.length} platforms with ${queries.length} custom queries...`)

  // Create all query tasks (queries x platforms)
  const tasks: Promise<BrandMentionResult>[] = []

  for (const query of queries) {
    for (const platform of platforms) {
      tasks.push(queryPlatform(platform, query, brandName))
    }
  }

  // Execute all queries in parallel across all platforms
  const results = await Promise.all(tasks)

  // Calculate aggregate metrics per platform
  const platformResults = platforms.map(platform => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
    const platformMentions = results.filter(r => r.platform === platformName && r.mentioned)
    const platformTotal = results.filter(r => r.platform === platformName)

    const avgProminence = platformMentions.length > 0
      ? platformMentions.reduce((sum, r) => sum + r.prominence_score, 0) / platformMentions.length
      : 0

    const avgSentimentScore = platformMentions.length > 0
      ? platformMentions.reduce((sum, r) => {
          if (r.sentiment === 'positive') return sum + 1
          if (r.sentiment === 'negative') return sum - 1
          return sum
        }, 0) / platformMentions.length
      : 0

    return {
      platform: platformName,
      mentions: platformMentions.length,
      avg_prominence: Math.round(avgProminence),
      avg_sentiment_score: avgSentimentScore,
    }
  })

  // Calculate overall metrics
  const totalMentions = results.filter(r => r.mentioned).length
  const mentionedResults = results.filter(r => r.mentioned)

  const avgProminence = mentionedResults.length > 0
    ? mentionedResults.reduce((sum, r) => sum + r.prominence_score, 0) / mentionedResults.length
    : 0

  // Visibility score: combination of mention rate and prominence
  const totalPossibleMentions = queries.length * platforms.length
  const mentionRate = (totalMentions / totalPossibleMentions) * 100
  const visibilityScore = Math.round((mentionRate * 0.5) + (avgProminence * 0.5))

  const totalCost = results.reduce((sum, r) => sum + r.cost, 0)

  return {
    brand_name: brandName,
    total_mentions: totalMentions,
    visibility_score: visibilityScore,
    queries_tested: queries.length,
    platform_results: platformResults,
    individual_results: results,
    total_cost: totalCost,
    timestamp: new Date().toISOString(),
  }
}

// Monitor a brand across multiple platforms and queries
export async function monitorBrand(
  brandName: string,
  industry?: string | null,
  numQueries: number = 5,
  platforms: AIPlatform[] = ENABLED_PLATFORMS
): Promise<MonitoringResult> {
  const queries = generateQueriesForBrand(brandName, industry).slice(0, numQueries)

  console.log(`Monitoring brand "${brandName}" across ${platforms.length} platforms with ${queries.length} queries...`)

  // Create all query tasks (queries x platforms)
  const tasks: Promise<BrandMentionResult>[] = []

  for (const query of queries) {
    for (const platform of platforms) {
      tasks.push(queryPlatform(platform, query, brandName))
    }
  }

  // Execute all queries in parallel across all platforms
  const results = await Promise.all(tasks)

  // Calculate aggregate metrics per platform
  const platformResults = platforms.map(platform => {
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
    const platformMentions = results.filter(r => r.platform === platformName && r.mentioned)
    const platformTotal = results.filter(r => r.platform === platformName)

    const avgProminence = platformMentions.length > 0
      ? platformMentions.reduce((sum, r) => sum + r.prominence_score, 0) / platformMentions.length
      : 0

    const avgSentimentScore = platformMentions.length > 0
      ? platformMentions.reduce((sum, r) => {
          if (r.sentiment === 'positive') return sum + 1
          if (r.sentiment === 'negative') return sum - 1
          return sum
        }, 0) / platformMentions.length
      : 0

    return {
      platform: platformName,
      mentions: platformMentions.length,
      avg_prominence: Math.round(avgProminence),
      avg_sentiment_score: avgSentimentScore,
    }
  })

  // Calculate overall metrics
  const totalMentions = results.filter(r => r.mentioned).length
  const mentionedResults = results.filter(r => r.mentioned)

  const avgProminence = mentionedResults.length > 0
    ? mentionedResults.reduce((sum, r) => sum + r.prominence_score, 0) / mentionedResults.length
    : 0

  // Visibility score: combination of mention rate and prominence
  const totalPossibleMentions = queries.length * platforms.length
  const mentionRate = (totalMentions / totalPossibleMentions) * 100
  const visibilityScore = Math.round((mentionRate * 0.5) + (avgProminence * 0.5))

  const totalCost = results.reduce((sum, r) => sum + r.cost, 0)

  return {
    brand_name: brandName,
    total_mentions: totalMentions,
    visibility_score: visibilityScore,
    queries_tested: queries.length,
    platform_results: platformResults,
    individual_results: results,
    total_cost: totalCost,
    timestamp: new Date().toISOString(),
  }
}
