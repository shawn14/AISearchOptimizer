import { NextRequest, NextResponse } from 'next/server'
import { getMonitoringRuns } from '@/lib/file-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')

    const runs = await getMonitoringRuns(brandId, limit)

    return NextResponse.json({ runs })
  } catch (error) {
    console.error('Error fetching monitoring runs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring runs' },
      { status: 500 }
    )
  }
}
