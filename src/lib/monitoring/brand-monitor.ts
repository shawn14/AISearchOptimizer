import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

// Query OpenAI and analyze brand mention
async function queryOpenAI(query: string, brandName: string): Promise<BrandMentionResult> {
  const startTime = Date.now()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    const usage = completion.usage

    // Calculate cost (gpt-4o-mini pricing: $0.150/1M input, $0.600/1M output)
    const inputCost = (usage?.prompt_tokens || 0) * 0.150 / 1_000_000
    const outputCost = (usage?.completion_tokens || 0) * 0.600 / 1_000_000
    const cost = inputCost + outputCost

    // Analyze brand mention
    const analysis = analyzeBrandMention(brandName, responseText)

    return {
      platform: 'ChatGPT',
      query,
      response_text: responseText,
      cost,
      ...analysis,
    }
  } catch (error) {
    console.error('OpenAI query error:', error)
    throw error
  }
}

// Monitor a brand across multiple queries
export async function monitorBrand(
  brandName: string,
  industry?: string | null,
  numQueries: number = 5
): Promise<MonitoringResult> {
  const queries = generateQueriesForBrand(brandName, industry).slice(0, numQueries)

  console.log(`Monitoring brand "${brandName}" with ${queries.length} queries...`)

  // Query all in parallel
  const results = await Promise.all(
    queries.map(query => queryOpenAI(query, brandName))
  )

  // Calculate aggregate metrics
  const totalMentions = results.filter(r => r.mentioned).length
  const mentionedResults = results.filter(r => r.mentioned)

  const avgProminence = mentionedResults.length > 0
    ? mentionedResults.reduce((sum, r) => sum + r.prominence_score, 0) / mentionedResults.length
    : 0

  // Visibility score: combination of mention rate and prominence
  const mentionRate = (totalMentions / queries.length) * 100
  const visibilityScore = Math.round((mentionRate * 0.5) + (avgProminence * 0.5))

  // Platform results
  const platformResults = [{
    platform: 'ChatGPT',
    mentions: totalMentions,
    avg_prominence: Math.round(avgProminence),
    avg_sentiment_score: mentionedResults.length > 0
      ? mentionedResults.reduce((sum, r) => {
          if (r.sentiment === 'positive') return sum + 1
          if (r.sentiment === 'negative') return sum - 1
          return sum
        }, 0) / mentionedResults.length
      : 0,
  }]

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
