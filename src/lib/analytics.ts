import { BrandMention, AIPlatform } from '@/types'

/**
 * Calculate visibility score (0-100) based on mentions and prominence
 */
export function calculateVisibilityScore(
  mentions: BrandMention[],
  totalQueries: number
): number {
  if (totalQueries === 0) return 0

  const mentionRate = mentions.filter(m => m.mentioned).length / totalQueries
  const avgProminence = mentions
    .filter(m => m.mentioned && m.prominence_score)
    .reduce((sum, m) => sum + (m.prominence_score || 0), 0) / mentions.filter(m => m.mentioned).length || 0

  // Weight: 60% mention rate, 40% prominence
  return Math.round((mentionRate * 0.6 + avgProminence * 0.4) * 100)
}

/**
 * Calculate share of voice vs competitors
 */
export function calculateShareOfVoice(
  brandMentions: number,
  competitorMentions: number[]
): number {
  const totalMentions = brandMentions + competitorMentions.reduce((a, b) => a + b, 0)
  if (totalMentions === 0) return 0
  return Math.round((brandMentions / totalMentions) * 100)
}

/**
 * Group mentions by platform
 */
export function groupByPlatform(mentions: BrandMention[]): Record<AIPlatform, BrandMention[]> {
  return mentions.reduce((acc, mention) => {
    if (!acc[mention.platform]) {
      acc[mention.platform] = []
    }
    acc[mention.platform].push(mention)
    return acc
  }, {} as Record<AIPlatform, BrandMention[]>)
}

/**
 * Generate mock historical data for visibility trends
 * TODO: Replace with actual database queries
 */
export function generateMockTrendData(days: number = 7): Array<{ date: string; score: number }> {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic trending data (60-80% range with slight variations)
    const baseScore = 72
    const variation = Math.sin(i * 0.5) * 5 + Math.random() * 3
    const score = Math.max(0, Math.min(100, baseScore + variation))

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(score * 10) / 10
    })
  }

  return data
}

/**
 * Generate mock competitor ranking data
 * TODO: Replace with actual database queries
 */
export function generateMockCompetitorData() {
  return [
    {
      rank: 1,
      brand: 'Lottie.org',
      mentions: 156,
      position: 1.8,
      change: +2.5,
      visibility: 72.5,
    },
    {
      rank: 2,
      brand: 'Birdie',
      mentions: 142,
      position: 2.1,
      change: -1.2,
      visibility: 68.3,
    },
    {
      rank: 3,
      brand: 'KareHero',
      mentions: 128,
      position: 2.4,
      change: +0.8,
      visibility: 62.1,
    },
    {
      rank: 4,
      brand: 'Mobilise',
      mentions: 115,
      position: 2.9,
      change: -2.3,
      visibility: 55.9,
    },
    {
      rank: 5,
      brand: 'Carehome.co.uk',
      mentions: 98,
      position: 3.2,
      change: +1.1,
      visibility: 48.7,
    },
  ]
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}
