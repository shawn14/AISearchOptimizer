import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

/**
 * Google Sign-In OAuth Initiation
 * Separate from GA connection - this is for user authentication
 */
export async function GET(request: NextRequest) {
  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/signin/callback`

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    // Generate the auth URL for sign-in (minimal scopes)
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'online', // No refresh token needed for basic sign-in
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      redirect_uri: redirectUri,
      prompt: 'select_account', // Let user select which Google account
    })

    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Error generating Google Sign-In URL:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin?error=google_signin_failed`
    )
  }
}
