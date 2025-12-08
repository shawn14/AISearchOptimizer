/**
 * LLM-Powered Query Generator
 * Uses AI to analyze a brand and generate intelligent monitoring queries
 */

import { queryClaude } from '../ai-clients/anthropic'

export interface GeneratedQuery {
  query: string
  category: string
  intent: string
  reasoning: string
}

export interface QueryGenerationResult {
  queries: GeneratedQuery[]
  totalCost: number
}

/**
 * Generate monitoring queries using LLM analysis of brand context
 */
export async function generateQueriesWithLLM(
  brandName: string,
  websiteUrl: string | null,
  industry: string | null,
  description: string | null,
  targetCount: number = 30
): Promise<QueryGenerationResult> {

  const prompt = buildQueryGenerationPrompt(
    brandName,
    websiteUrl,
    industry,
    description,
    targetCount
  )

  // Use Claude Haiku for cost efficiency
  const response = await queryClaude(prompt, 'claude-3-haiku-20240307')

  // Parse the LLM response to extract queries
  const queries = parseQueryResponse(response.text)

  return {
    queries,
    totalCost: response.metadata.cost
  }
}

/**
 * Build the prompt for LLM query generation
 */
function buildQueryGenerationPrompt(
  brandName: string,
  websiteUrl: string | null,
  industry: string | null,
  description: string | null,
  targetCount: number
): string {
  return `You are an AI Search Optimization expert specializing in LLM visibility monitoring. Your task is to generate the most important queries that ${brandName} should monitor across AI platforms like ChatGPT, Claude, Perplexity, and Gemini.

# Brand Context
- **Brand Name:** ${brandName}
- **Industry:** ${industry || 'Not specified'}
- **Description:** ${description || 'Not provided'}
- **Website:** ${websiteUrl || 'Not provided'}

# Your Task
Generate ${targetCount} queries that represent the MOST IMPORTANT questions people would ask AI assistants where ${brandName} should ideally be mentioned in the response.

# Query Categories to Cover
1. **Best-in-category** - "What are the best [product type]?"
2. **Recommendations** - "Can you recommend [solution] for [use case]?"
3. **Alternatives** - "What are alternatives to [competitor]?"
4. **Comparisons** - "${brandName} vs [competitor]"
5. **Feature-specific** - "Which [product] has [feature]?"
6. **Use-case driven** - "[Product type] for [specific need]"
7. **How-to questions** - "How to [achieve goal] with [product]?"
8. **Evaluation** - "Is ${brandName} good for [use case]?"
9. **Problem-solving** - "How to solve [pain point]?"
10. **Buying intent** - "Which [product] should I choose for [need]?"

# Instructions
- Focus on queries where ${brandName} is a strong, relevant answer
- Include queries at different stages of buyer journey (research, comparison, decision)
- Mix branded queries (mentioning ${brandName}) with category queries (where they should appear)
- Be specific and realistic - think like actual users asking AI assistants
- Prioritize high-value queries where being mentioned matters most

# Output Format
Return ONLY a JSON array with this exact structure:

\`\`\`json
[
  {
    "query": "What are the best stock tracking apps for day traders?",
    "category": "best-in-category",
    "intent": "research",
    "reasoning": "High-value category query where competitive positioning matters"
  },
  {
    "query": "StockAlarm vs Robinhood for price alerts",
    "category": "comparison",
    "intent": "decision",
    "reasoning": "Direct comparison with major competitor in key feature area"
  }
]
\`\`\`

Generate ${targetCount} queries now. Return ONLY the JSON array, no other text.`
}

/**
 * Parse LLM response to extract queries
 */
function parseQueryResponse(responseText: string): GeneratedQuery[] {
  try {
    // Extract JSON from response (handles code blocks)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                     responseText.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText.substring(0, 200))
      return []
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonText)

    // Validate structure
    if (!Array.isArray(parsed)) {
      console.error('Response is not an array')
      return []
    }

    // Filter and validate each query
    const queries: GeneratedQuery[] = parsed
      .filter(item =>
        item.query &&
        typeof item.query === 'string' &&
        item.category &&
        item.intent
      )
      .map(item => ({
        query: item.query.trim(),
        category: item.category,
        intent: item.intent,
        reasoning: item.reasoning || ''
      }))

    return queries

  } catch (error) {
    console.error('Failed to parse query response:', error)
    console.error('Response text:', responseText.substring(0, 500))
    return []
  }
}

/**
 * Generate queries with caching (to avoid regenerating for same brand)
 */
const queryCache = new Map<string, { queries: GeneratedQuery[]; timestamp: number }>()
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function generateQueriesWithCache(
  brandName: string,
  websiteUrl: string | null,
  industry: string | null,
  description: string | null,
  targetCount: number = 30
): Promise<QueryGenerationResult> {
  const cacheKey = `${brandName}-${industry}-${description}-${targetCount}`

  // Check cache
  const cached = queryCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('Returning cached queries for', brandName)
    return {
      queries: cached.queries,
      totalCost: 0 // No cost for cached results
    }
  }

  // Generate fresh queries
  const result = await generateQueriesWithLLM(
    brandName,
    websiteUrl,
    industry,
    description,
    targetCount
  )

  // Cache the results
  queryCache.set(cacheKey, {
    queries: result.queries,
    timestamp: Date.now()
  })

  return result
}
