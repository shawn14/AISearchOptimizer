/**
 * AI-Powered Dashboard Insights Generator
 * Uses Claude Sonnet to analyze dashboard metrics and provide strategic recommendations
 */

import { queryClaude } from '../ai-clients/anthropic'

export interface DashboardMetrics {
  // Overall metrics
  avgVisibilityScore: number
  totalMentions: number
  totalQueriesTested: number

  // Platform breakdown
  platformStats: Record<string, {
    total: number
    mentions: number
    visibility: number
  }>

  // Recent mentions
  recentMentionsCount: number
  sentimentBreakdown?: {
    positive: number
    neutral: number
    negative: number
  }

  // Audit data (if available)
  avgTechnicalScore?: number
  avgContentScore?: number
  avgAEOScore?: number
  auditsCount?: number

  // Traffic data (if available)
  gaConnected?: boolean
  totalUsers?: number
  totalSessions?: number
  totalPageViews?: number

  // Brand info
  brandName: string
  industry?: string
}

export interface InsightsResult {
  summary: string
  opportunities: string[]
  concerns: string[]
  recommendations: string[]
  cost: number
}

/**
 * Generate AI insights from dashboard metrics
 */
export async function generateDashboardInsights(
  metrics: DashboardMetrics
): Promise<InsightsResult> {
  const prompt = buildInsightsPrompt(metrics)

  // Use Claude Sonnet for better reasoning
  const response = await queryClaude(prompt, 'claude-sonnet-4-20250514')

  // Parse the response
  const insights = parseInsightsResponse(response.text)

  return {
    ...insights,
    cost: response.metadata.cost
  }
}

/**
 * Build the analysis prompt
 */
function buildInsightsPrompt(metrics: DashboardMetrics): string {
  const {
    avgVisibilityScore,
    totalMentions,
    totalQueriesTested,
    platformStats,
    recentMentionsCount,
    sentimentBreakdown,
    avgTechnicalScore,
    avgContentScore,
    avgAEOScore,
    auditsCount,
    gaConnected,
    totalUsers,
    totalSessions,
    totalPageViews,
    brandName,
    industry
  } = metrics

  // Calculate mention rate
  const mentionRate = totalQueriesTested > 0
    ? Math.round((totalMentions / totalQueriesTested) * 100)
    : 0

  // Platform performance summary
  const platformSummary = Object.entries(platformStats)
    .map(([platform, stats]) =>
      `${platform}: ${stats.visibility}% visibility (${stats.mentions}/${stats.total} queries)`
    )
    .join('\n')

  return `You are an AI Search Optimization expert analyzing dashboard metrics for ${brandName}${industry ? ` (${industry} industry)` : ''}.

# Current Metrics

## LLM Visibility
- **Overall Visibility Score:** ${avgVisibilityScore}/100
- **Total Mentions:** ${totalMentions} out of ${totalQueriesTested} queries tested (${mentionRate}% mention rate)
- **Recent Mentions:** ${recentMentionsCount}

## Platform Breakdown
${platformSummary}

${sentimentBreakdown ? `## Sentiment Analysis
- Positive: ${sentimentBreakdown.positive}
- Neutral: ${sentimentBreakdown.neutral}
- Negative: ${sentimentBreakdown.negative}
` : ''}

${avgAEOScore ? `## Content Quality (${auditsCount} pages audited)
- Technical SEO: ${avgTechnicalScore}/100
- Content Quality: ${avgContentScore}/100
- AEO Score: ${avgAEOScore}/100
` : ''}

${gaConnected ? `## Website Traffic (Last 30 days)
- Total Users: ${totalUsers?.toLocaleString()}
- Total Sessions: ${totalSessions?.toLocaleString()}
- Total Page Views: ${totalPageViews?.toLocaleString()}
${totalSessions && totalPageViews ? `- Pages per Session: ${(totalPageViews / totalSessions).toFixed(1)}` : ''}
` : ''}

# Your Task

Analyze these metrics and provide a strategic assessment in the following JSON format:

\`\`\`json
{
  "summary": "2-3 sentence executive summary of overall performance",
  "opportunities": [
    "Specific opportunity #1",
    "Specific opportunity #2",
    "Specific opportunity #3"
  ],
  "concerns": [
    "Specific concern #1 (or empty if none)",
    "Specific concern #2 (or empty if none)"
  ],
  "recommendations": [
    "Specific actionable recommendation #1",
    "Specific actionable recommendation #2",
    "Specific actionable recommendation #3"
  ]
}
\`\`\`

# Analysis Guidelines

**Summary:**
- Start with the overall visibility score context (excellent 80+, good 60-79, needs work <60)
- Mention strongest and weakest platforms
- Note any standout metrics (traffic, sentiment, etc.)

**Opportunities:**
- Identify platforms with low visibility that could be improved
- Highlight positive sentiment trends to leverage
- Note content gaps based on AEO scores
- Call out traffic opportunities if GA data shows potential

**Concerns:**
- Flag platforms with 0% visibility
- Note negative sentiment issues
- Identify low AEO scores that need attention
- Warn about declining metrics if apparent

**Recommendations:**
- Be specific and actionable (not generic advice)
- Prioritize by impact (most important first)
- Reference actual platform names and metrics
- Suggest concrete next steps

Return ONLY the JSON object, no other text.`
}

/**
 * Parse insights from Claude's response
 */
function parseInsightsResponse(responseText: string): Omit<InsightsResult, 'cost'> {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                     responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('No JSON found in insights response')
      return getDefaultInsights()
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const parsed = JSON.parse(jsonText)

    return {
      summary: parsed.summary || 'Analysis unavailable',
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities.filter((o: any) => o && o.trim())
        : [],
      concerns: Array.isArray(parsed.concerns)
        ? parsed.concerns.filter((c: any) => c && c.trim())
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter((r: any) => r && r.trim())
        : []
    }
  } catch (error) {
    console.error('Failed to parse insights response:', error)
    return getDefaultInsights()
  }
}

/**
 * Fallback insights if parsing fails
 */
function getDefaultInsights(): Omit<InsightsResult, 'cost'> {
  return {
    summary: 'Unable to generate insights at this time. Please try refreshing.',
    opportunities: [],
    concerns: [],
    recommendations: []
  }
}
