import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { createOrGetGoogleUser } from '@/lib/firebase/storage'
import { createSession, setSessionCookie } from '@/lib/auth/session'

/**
 * Google Sign-In Callback
 * Handles the OAuth callback and creates/gets user, then creates session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`${baseUrl}/signin?error=google_oauth_denied`)
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/signin?error=missing_code`)
    }

    const redirectUri = `${baseUrl}/api/auth/google/signin/callback`

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info from Google')
      return NextResponse.redirect(`${baseUrl}/signin?error=google_userinfo_failed`)
    }

    const googleUser = await userInfoResponse.json()

    // Create or get user in our database
    const user = await createOrGetGoogleUser({
      email: googleUser.email,
      firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
      lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
      googleId: googleUser.id,
      avatarUrl: googleUser.picture,
    })

    // Create session
    const token = await createSession({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    })

    // Set session cookie
    await setSessionCookie(token)

    // Redirect to dashboard
    return NextResponse.redirect(`${baseUrl}/dashboard`)

  } catch (error) {
    console.error('Error in Google Sign-In callback:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin?error=google_signin_failed`
    )
  }
}
