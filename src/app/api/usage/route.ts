import { NextRequest, NextResponse } from 'next/server'
import { getUsageStats, getRemainingQuota } from '@/lib/rate-limiting'

export async function GET(request: NextRequest) {
  try {
    // Get user ID (in production, get from auth)
    const userId = request.headers.get('x-user-id') || 'anonymous'

    const stats = getUsageStats(userId)
    const remaining = getRemainingQuota(userId)

    return NextResponse.json({
      success: true,
      stats,
      remaining,
    })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get usage stats',
      },
      { status: 500 }
    )
  }
}
