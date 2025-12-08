import { NextRequest, NextResponse } from 'next/server'
import { saveGACredentials } from '@/lib/firebase/storage'

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

    const formData = await request.formData()
    const file = formData.get('credentials') as File
    const propertyId = formData.get('propertyId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No credentials file provided' },
        { status: 400 }
      )
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Google Analytics Property ID is required' },
        { status: 400 }
      )
    }

    // Validate it's a JSON file
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'File must be a JSON file' },
        { status: 400 }
      )
    }

    // Read the file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const content = buffer.toString('utf-8')

    // Validate it's valid JSON
    let jsonData: any
    try {
      jsonData = JSON.parse(content)

      // Validate it has the required service account fields
      if (!jsonData.type || jsonData.type !== 'service_account') {
        return NextResponse.json(
          { error: 'Invalid credentials file. Must be a service account JSON key.' },
          { status: 400 }
        )
      }

      if (!jsonData.private_key || !jsonData.client_email) {
        return NextResponse.json(
          { error: 'Invalid credentials file. Missing required fields.' },
          { status: 400 }
        )
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON file' },
        { status: 400 }
      )
    }

    // Save credentials to user's database record (encrypted)
    await saveGACredentials(userId, {
      propertyId,
      credentials: jsonData,
      lastSynced: new Date().toISOString()
    })

    console.log(`Google Analytics credentials saved for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Google Analytics connected successfully',
      propertyId,
    })

  } catch (error) {
    console.error('Error uploading credentials:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload credentials'
      },
      { status: 500 }
    )
  }
}
