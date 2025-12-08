import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { saveSelectedGAProperty } from '@/lib/firebase/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Validate property ID format (should be numeric)
    if (!/^\d+$/.test(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid Property ID format. Should be numeric (e.g., 123456789)' },
        { status: 400 }
      )
    }

    // Save selected property
    await saveSelectedGAProperty(session.userId, propertyId)

    return NextResponse.json({
      success: true,
      message: 'Property selected successfully',
      propertyId
    })

  } catch (error) {
    console.error('Error selecting GA property:', error)
    return NextResponse.json(
      { error: 'Failed to select property' },
      { status: 500 }
    )
  }
}
