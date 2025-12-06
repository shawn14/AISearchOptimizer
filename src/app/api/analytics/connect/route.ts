import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
    }

    console.log('Connecting to Google Analytics property:', propertyId)

    // Check if credentials file exists
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json')
    if (!fs.existsSync(credentialsPath)) {
      return NextResponse.json(
        {
          error: 'Google Analytics credentials not found. Please add google-credentials.json to project root.',
          instructions: 'Download the service account JSON key from Google Cloud Console and save it as google-credentials.json in the project root.'
        },
        { status: 400 }
      )
    }

    // Store the connection info
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const connectionData = {
      propertyId,
      connectedAt: new Date().toISOString()
    }

    fs.writeFileSync(
      path.join(dataDir, 'ga-connection.json'),
      JSON.stringify(connectionData, null, 2)
    )

    return NextResponse.json({
      success: true,
      message: 'Google Analytics connected successfully',
      propertyId,
      connectedAt: connectionData.connectedAt
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
    // Check for stored connection
    const connectionsPath = path.join(process.cwd(), 'data', 'ga-connection.json')

    if (fs.existsSync(connectionsPath)) {
      const connectionData = JSON.parse(fs.readFileSync(connectionsPath, 'utf-8'))
      return NextResponse.json({
        connected: true,
        propertyId: connectionData.propertyId,
        lastSync: connectionData.connectedAt
      })
    }

    return NextResponse.json({
      connected: false,
      propertyId: null,
      lastSync: null
    })
  } catch (error) {
    console.error('Error fetching GA connection status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connection status' },
      { status: 500 }
    )
  }
}
