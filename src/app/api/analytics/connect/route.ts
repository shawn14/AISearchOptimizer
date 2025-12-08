import { NextRequest, NextResponse } from 'next/server'
import { getGACredentials } from '@/lib/firebase/storage'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from session/auth (for now using header)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    console.log('Connecting to Google Analytics property:', propertyId, 'for user:', userId)

    // Check if user has uploaded credentials
    const gaData = await getGACredentials(userId)

    if (!gaData) {
      return NextResponse.json(
        {
          error: 'Google Analytics credentials not found. Please upload your service account JSON key first.',
          instructions: 'Go to Settings > Analytics to upload your Google Analytics credentials.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Google Analytics connected successfully',
      propertyId: gaData.propertyId,
    })

  } catch (error) {
    console.error('GA connection error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to connect Google Analytics',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth (for now using header)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    // Check for user's GA connection
    const gaData = await getGACredentials(userId)

    if (gaData) {
      return NextResponse.json({
        connected: true,
        propertyId: gaData.propertyId,
      })
    }

    return NextResponse.json({
      connected: false,
      propertyId: null,
    })
  } catch (error) {
    console.error('Error fetching GA connection status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    )
  }
}
