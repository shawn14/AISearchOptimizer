import { NextResponse } from "next/server"
import { getMonitoringRuns, getAudits, getBrands } from "@/lib/file-storage"

export async function GET() {
  try {
    // Fetch real data
    const monitoringRuns = await getMonitoringRuns(undefined, 10)
    const audits = await getAudits()
    const brands = await getBrands()

    // Get latest monitoring run
    const latestRun = monitoringRuns[0] || null

    // Calculate platform-specific stats from real data
    let platformStats = {
      chatgpt: { position: 0, percentage: 0, mentions: 0 },
      google: { position: 0, percentage: 0, mentions: 0 },
      perplexity: { position: 0, percentage: 0, mentions: 0 },
    }

    if (latestRun && latestRun.platform_results) {
      latestRun.platform_results.forEach((pr: any) => {
        const platform = pr.platform.toLowerCase()
        const platformKey = platform === "chatgpt" ? "chatgpt" : platform === "google" ? "google" : "perplexity"

        if (platformStats[platformKey as keyof typeof platformStats]) {
          platformStats[platformKey as keyof typeof platformStats] = {
            position: pr.avg_prominence || 0,
            percentage: latestRun.queries_tested > 0
              ? Math.round((pr.mentions / latestRun.queries_tested) * 100)
              : 0,
            mentions: pr.mentions || 0,
          }
        }
      })
    }

    // Get real AI query example from monitoring data
    let realQueryExample = null
    if (latestRun && latestRun.individual_results && latestRun.individual_results.length > 0) {
      // Find a query where the brand was mentioned
      const mentionedQuery = latestRun.individual_results.find((r: any) => r.mentioned)
      const exampleQuery = mentionedQuery || latestRun.individual_results[0]

      realQueryExample = {
        query: exampleQuery.query,
        response: exampleQuery.response_text,
        mentioned: exampleQuery.mentioned,
        platform: exampleQuery.platform,
        prominence: exampleQuery.prominence_score || 0,
      }
    }

    // Calculate AEO stats from real audits
    const avgAEO = audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + (a.aeo_score || 0), 0) / audits.length)
      : 0

    const avgTechnical = audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + (a.technical_score || 0), 0) / audits.length)
      : 0

    const avgContent = audits.length > 0
      ? Math.round(audits.reduce((sum, a) => sum + (a.content_score || 0), 0) / audits.length)
      : 0

    // Get top and bottom performing pages
    const sortedAudits = [...audits].sort((a, b) => (b.aeo_score || 0) - (a.aeo_score || 0))
    const topPage = sortedAudits[0] || null
    const bottomPage = sortedAudits[sortedAudits.length - 1] || null

    // Build response
    return NextResponse.json({
      hasData: monitoringRuns.length > 0 || audits.length > 0,
      brands: brands.length,
      analytics: {
        visibilityScore: latestRun?.visibility_score || 0,
        totalMentions: latestRun?.total_mentions || 0,
        queriesTested: latestRun?.queries_tested || 0,
        mentionRate: latestRun && latestRun.queries_tested > 0
          ? Math.round((latestRun.total_mentions / latestRun.queries_tested) * 100)
          : 0,
        platformStats,
        realQueryExample,
        brandName: latestRun?.brand_name || brands[0]?.name || "Your Brand",
      },
      monitoring: {
        totalRuns: monitoringRuns.length,
        platforms: ["ChatGPT", "Google", "Perplexity"],
        recentActivity: monitoringRuns.slice(0, 5).map(run => ({
          timestamp: run.timestamp,
          visibilityScore: run.visibility_score,
          mentions: run.total_mentions,
          queries: run.queries_tested,
        })),
      },
      content: {
        pagesAudited: audits.length,
        avgAEO,
        avgTechnical,
        avgContent,
        topPage: topPage ? {
          title: topPage.page_title || topPage.page_url,
          url: topPage.page_url,
          aeoScore: topPage.aeo_score || 0,
        } : null,
        bottomPage: bottomPage ? {
          title: bottomPage.page_title || bottomPage.page_url,
          url: bottomPage.page_url,
          aeoScore: bottomPage.aeo_score || 0,
        } : null,
      },
      optimization: {
        recommendations: generateRecommendations(latestRun, audits),
      },
    })
  } catch (error) {
    console.error("Error fetching homepage data:", error)
    return NextResponse.json(
      { error: "Failed to fetch homepage data", hasData: false },
      { status: 500 }
    )
  }
}

function generateRecommendations(latestRun: any, audits: any[]) {
  const recommendations = []

  // Check visibility score
  if (latestRun) {
    if (latestRun.visibility_score < 50) {
      recommendations.push({
        title: "Improve AI Search Visibility",
        description: `Your visibility score is ${latestRun.visibility_score}/100. Focus on creating more direct, authoritative content.`,
        priority: "high",
      })
    }

    // Check mention rate
    const mentionRate = latestRun.queries_tested > 0
      ? (latestRun.total_mentions / latestRun.queries_tested) * 100
      : 0

    if (mentionRate < 40) {
      recommendations.push({
        title: "Increase Brand Mentions",
        description: `You're mentioned in ${Math.round(mentionRate)}% of AI responses. Target more relevant queries in your content.`,
        priority: "high",
      })
    }
  }

  // Check AEO scores
  const lowAEOPages = audits.filter(a => (a.aeo_score || 0) < 70)
  if (lowAEOPages.length > 0) {
    recommendations.push({
      title: "Optimize Low-Performing Pages",
      description: `${lowAEOPages.length} page${lowAEOPages.length > 1 ? 's have' : ' has'} AEO scores below 70. Add structured data and clear answers.`,
      priority: "medium",
    })
  }

  // If no data yet
  if (!latestRun && audits.length === 0) {
    recommendations.push({
      title: "Get Started with Monitoring",
      description: "Run your first AI search monitoring to see where you rank across platforms.",
      priority: "high",
    })
    recommendations.push({
      title: "Audit Your Pages",
      description: "Analyze your top pages for AEO optimization opportunities.",
      priority: "medium",
    })
  }

  return recommendations.slice(0, 3) // Return top 3
}
