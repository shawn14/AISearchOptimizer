import { NextRequest, NextResponse } from 'next/server'
import { getAudits } from '@/lib/file-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId') || undefined

    const audits = await getAudits(brandId)

    // Sort by last_audited_at (most recent first)
    audits.sort((a, b) => {
      if (!a.last_audited_at && !b.last_audited_at) return 0
      if (!a.last_audited_at) return 1
      if (!b.last_audited_at) return -1
      return new Date(b.last_audited_at).getTime() - new Date(a.last_audited_at).getTime()
    })

    return NextResponse.json({ audits })
  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    )
  }
}
