import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import { saveGAOAuthTokens } from '@/lib/firebase/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This is the userId
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/settings?error=oauth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/settings?error=missing_code`
      )
    }

    const userId = state

    // Exchange code for tokens
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/google/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get available GA4 properties for the user
    const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client })

    let properties: any[] = []
    try {
      const accountSummaries = await analyticsAdmin.accountSummaries.list()

      // Extract all GA4 properties
      accountSummaries.data.accountSummaries?.forEach((account: any) => {
        account.propertySummaries?.forEach((property: any) => {
          // Extract numeric property ID from "properties/123456789" format
          const propertyId = property.property?.split('/')[1]
          if (propertyId) {
            properties.push({
              id: propertyId,
              name: property.displayName || 'Unnamed Property',
            })
          }
        })
      })
    } catch (error) {
      console.error('Error fetching GA properties:', error)
      // Continue even if we can't fetch properties - user can enter manually
    }

    // Save tokens to Firebase
    await saveGAOAuthTokens(userId, {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || null,
      expiryDate: tokens.expiry_date || null,
      properties, // Store available properties
    })

    // Redirect back to settings with success
    const redirectUrl = properties.length > 0
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/settings?oauth=success&properties=${encodeURIComponent(JSON.stringify(properties))}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/settings?oauth=success`

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/dashboard/settings?error=oauth_failed`
    )
  }
}
