import { queryOpenAI } from './openai'
import { queryClaude } from './anthropic'
import { queryGemini } from './gemini'
import { AIClientResponse, AIPlatform } from '@/types'

export * from './openai'
export * from './anthropic'
export * from './gemini'

/**
 * Query all AI platforms in parallel for a given prompt
 */
export async function queryAllPlatforms(
  prompt: string,
  platforms: AIPlatform[] = ['chatgpt', 'claude', 'gemini']
): Promise<AIClientResponse[]> {
  const promises: Promise<AIClientResponse>[] = []

  platforms.forEach(platform => {
    switch (platform) {
      case 'chatgpt':
        promises.push(queryOpenAI(prompt))
        break
      case 'claude':
        promises.push(queryClaude(prompt))
        break
      case 'gemini':
        promises.push(queryGemini(prompt))
        break
      case 'perplexity':
        // TODO: Implement Perplexity client
        console.warn('Perplexity not yet implemented')
        break
      case 'grok':
        // TODO: Implement Grok client
        console.warn('Grok not yet implemented')
        break
    }
  })

  // Execute all queries in parallel
  const results = await Promise.allSettled(promises)

  // Filter out failed queries and return successful responses
  return results
    .filter((result): result is PromiseFulfilledResult<AIClientResponse> =>
      result.status === 'fulfilled'
    )
    .map(result => result.value)
}

/**
 * Query a specific platform
 */
export async function queryPlatform(
  platform: AIPlatform,
  prompt: string,
  model?: string
): Promise<AIClientResponse> {
  switch (platform) {
    case 'chatgpt':
      return queryOpenAI(prompt, model)
    case 'claude':
      return queryClaude(prompt, model)
    case 'gemini':
      return queryGemini(prompt, model)
    case 'perplexity':
      throw new Error('Perplexity not yet implemented')
    case 'grok':
      throw new Error('Grok not yet implemented')
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}

/**
 * Analyze a response for brand mentions
 */
export function analyzeBrandMention(
  responseText: string,
  brandName: string,
  brandDomain?: string
): {
  mentioned: boolean
  position?: number
  prominence_score?: number
  context_snippet?: string
  citation_url?: string
} {
  const text = responseText.toLowerCase()
  const brand = brandName.toLowerCase()

  const mentioned = text.includes(brand)

  if (!mentioned) {
    return { mentioned: false }
  }

  // Find position of first mention
  const position = text.indexOf(brand)

  // Extract context around mention (100 chars before and after)
  const contextStart = Math.max(0, position - 100)
  const contextEnd = Math.min(responseText.length, position + brandName.length + 100)
  const context_snippet = responseText.substring(contextStart, contextEnd)

  // Calculate prominence score (earlier mentions = higher score)
  // Score is 1.0 if mentioned in first 100 chars, decreases to 0.1 at end
  const prominence_score = Math.max(0.1, 1.0 - (position / responseText.length))

  // Check if brand domain is cited
  let citation_url: string | undefined
  if (brandDomain) {
    const domainRegex = new RegExp(brandDomain.replace(/\./g, '\\.'), 'i')
    const match = responseText.match(domainRegex)
    if (match) {
      // Try to extract full URL
      const urlMatch = responseText.match(new RegExp(`https?://[^\\s]*${brandDomain}[^\\s]*`, 'i'))
      citation_url = urlMatch?.[0]
    }
  }

  return {
    mentioned: true,
    position,
    prominence_score,
    context_snippet,
    citation_url,
  }
}

/**
 * Calculate basic sentiment score for a text snippet
 * Returns -1 (negative) to 1 (positive)
 */
export function calculateSentiment(text: string): {
  sentiment: 'positive' | 'negative' | 'neutral'
  score: number
} {
  const positiveWords = [
    'excellent', 'great', 'good', 'best', 'leading', 'top', 'innovative',
    'trusted', 'reliable', 'quality', 'superior', 'outstanding', 'effective',
    'popular', 'recommended', 'love', 'amazing'
  ]

  const negativeWords = [
    'bad', 'poor', 'worst', 'terrible', 'unreliable', 'disappointing',
    'ineffective', 'expensive', 'limited', 'lacking', 'issues', 'problems',
    'concerns', 'complaints', 'avoid'
  ]

  const lowerText = text.toLowerCase()

  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowerText.match(regex)
    if (matches) positiveCount += matches.length
  })

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const matches = lowerText.match(regex)
    if (matches) negativeCount += matches.length
  })

  const totalWords = positiveCount + negativeCount

  if (totalWords === 0) {
    return { sentiment: 'neutral', score: 0 }
  }

  const score = (positiveCount - negativeCount) / totalWords

  let sentiment: 'positive' | 'negative' | 'neutral'
  if (score > 0.2) sentiment = 'positive'
  else if (score < -0.2) sentiment = 'negative'
  else sentiment = 'neutral'

  return { sentiment, score }
}
