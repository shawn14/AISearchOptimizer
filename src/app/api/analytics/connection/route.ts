import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { saveGACredentials, getGACredentials, deleteGACredentials } from '@/lib/firebase/storage'

// GET - Check if GA is connected
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const gaData = await getGACredentials(session.user.id)

    if (!gaData) {
      return NextResponse.json({
        connected: false
      })
    }

    return NextResponse.json({
      connected: true,
      propertyId: gaData.propertyId,
      lastSynced: gaData.lastSynced || null
    })

  } catch (error) {
    console.error('Error checking GA connection:', error)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}

// POST - Save GA credentials
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { propertyId, credentials } = await request.json()

    // Validate inputs
    if (!propertyId || !credentials) {
      return NextResponse.json(
        { error: 'Property ID and credentials are required' },
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

    // Validate credentials structure
    if (!credentials.type || !credentials.project_id || !credentials.private_key || !credentials.client_email) {
      return NextResponse.json(
        { error: 'Invalid service account JSON. Missing required fields.' },
        { status: 400 }
      )
    }

    // Save to Firebase
    await saveGACredentials(session.user.id, {
      propertyId,
      credentials,
      lastSynced: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Google Analytics connected successfully'
    })

  } catch (error) {
    console.error('Error saving GA credentials:', error)
    return NextResponse.json(
      { error: 'Failed to save GA credentials' },
      { status: 500 }
    )
  }
}

// DELETE - Disconnect GA
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await deleteGACredentials(session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Google Analytics disconnected successfully'
    })

  } catch (error) {
    console.error('Error deleting GA credentials:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect GA' },
      { status: 500 }
    )
  }
}
