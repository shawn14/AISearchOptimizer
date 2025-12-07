import { NextRequest, NextResponse} from 'next/server'
import { getAllAudits } from '@/lib/firebase/storage'

export async function GET(request: NextRequest) {
  try {
    const audits = await getAllAudits()
    // Firebase storage already sorts by last_audited_at desc
    return NextResponse.json({ audits })
  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    )
  }
}
