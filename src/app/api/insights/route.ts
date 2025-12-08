import { NextRequest, NextResponse } from 'next/server'
import { generateDashboardInsights, DashboardMetrics } from '@/lib/insights/dashboard-analyzer'
import { getSession } from '@/lib/auth/session'
import { db, COLLECTIONS } from '@/lib/firebase/config'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Save insights to Firestore
    await db.collection(COLLECTIONS.INSIGHTS).doc(session.userId).set({
      summary: insights.summary,
      opportunities: insights.opportunities,
      concerns: insights.concerns,
      recommendations: insights.recommendations,
      cost: insights.cost,
      generated_at: Timestamp.now(),
      brand_name: metrics.brandName
    })

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

// GET endpoint to retrieve cached insights
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doc = await db.collection(COLLECTIONS.INSIGHTS).doc(session.userId).get()

    if (!doc.exists) {
      return NextResponse.json({ insights: null })
    }

    const data = doc.data()
    return NextResponse.json({
      insights: {
        summary: data?.summary,
        opportunities: data?.opportunities,
        concerns: data?.concerns,
        recommendations: data?.recommendations,
        cost: data?.cost
      }
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}
