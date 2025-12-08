import { NextRequest, NextResponse } from 'next/server'
import { generateDashboardInsights, DashboardMetrics } from '@/lib/insights/dashboard-analyzer'

export async function POST(request: NextRequest) {
  try {
    const metrics: DashboardMetrics = await request.json()

    // Validate required fields
    if (!metrics.brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    console.log(`Generating insights for ${metrics.brandName}...`)

    const insights = await generateDashboardInsights(metrics)

    console.log(`Insights generated. Cost: $${insights.cost.toFixed(4)}`)

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
