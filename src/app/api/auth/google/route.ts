import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in first' },
        { status: 401 }
      )
    }

    // Create OAuth2 client
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    console.log('Generating OAuth URL with redirect_uri:', redirectUri)

    // Generate the auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: [
        'https://www.googleapis.com/auth/analytics.readonly',
      ],
      redirect_uri: redirectUri, // Explicitly set redirect_uri
      // Store user ID in state to retrieve after callback
      state: session.userId,
      prompt: 'consent', // Force consent screen to get refresh token
    })

    return NextResponse.json({ url: authUrl })

  } catch (error) {
    console.error('Error generating OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    )
  }
}
