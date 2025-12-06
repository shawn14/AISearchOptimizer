import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('credentials') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No credentials file provided' },
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
    try {
      const jsonData = JSON.parse(content)

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

    // Save the file
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json')
    fs.writeFileSync(credentialsPath, content)

    console.log('Google Analytics credentials saved successfully')

    return NextResponse.json({
      success: true,
      message: 'Credentials uploaded successfully'
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
