import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getGAOAuthTokens } from '@/lib/firebase/storage'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { OAuth2Client } from 'google-auth-library'
import { db, COLLECTIONS } from '@/lib/firebase/config'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Starting OAuth GA Test Connection ===')
    const session = await getSession()
    console.log('Session:', session ? `User ID: ${session.userId}` : 'No session')

    if (!session?.userId) {
      console.log('ERROR: No session or userId')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get OAuth tokens
    console.log('Fetching OAuth tokens for user:', session.userId)
    const tokens = await getGAOAuthTokens(session.userId)

    if (!tokens || !tokens.accessToken) {
      console.log('ERROR: No OAuth tokens found')
      return NextResponse.json(
        { error: 'Google Analytics not connected. Please connect first.' },
        { status: 400 }
      )
    }

    // Get property ID
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(session.userId).get()
    const userData = userDoc.data()
    const propertyId = userData?.ga_property_id

    if (!propertyId) {
      console.log('ERROR: No property ID selected')
      return NextResponse.json(
        { error: 'Please select a GA4 property first.' },
        { status: 400 }
      )
    }

    console.log('Property ID:', propertyId)

    // Create OAuth2 client with tokens
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken || undefined,
      expiry_date: tokens.expiryDate || undefined,
    })

    // Initialize GA Data API client with OAuth
    console.log('Initializing GA Data API client with OAuth...')
    const analyticsDataClient = new BetaAnalyticsDataClient({
      authClient: oauth2Client,
    })

    // Test connection by fetching last 7 days of data
    console.log('Attempting to fetch data from property:', propertyId)
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
    })

    // Calculate totals
    const totalUsers = response.rows?.reduce((sum, row) => {
      return sum + parseInt(row.metricValues?.[0]?.value || '0')
    }, 0) || 0

    const totalSessions = response.rows?.reduce((sum, row) => {
      return sum + parseInt(row.metricValues?.[1]?.value || '0')
    }, 0) || 0

    console.log('✅ Success! Users:', totalUsers, 'Sessions:', totalSessions)

    return NextResponse.json({
      success: true,
      message: 'Connection successful!',
      metrics: {
        totalUsers,
        totalSessions,
      },
      propertyId,
    })

  } catch (error) {
    // Enhanced error logging
    console.error('=== OAuth GA Test Connection Error ===')
    console.error('Full error object:', JSON.stringify(error, null, 2))
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code:', (error as any).code)
    }
    console.error('================================')

    // Provide helpful error messages
    let errorMessage = 'Connection test failed'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'
    let projectId: string | null = null

    // Extract project ID from error message if this is an API not enabled error
    if (errorDetails.includes('has not been used') || errorDetails.includes('is disabled')) {
      const projectIdMatch = errorDetails.match(/project[=\s]+(\d+)/)
      if (projectIdMatch) {
        projectId = projectIdMatch[1]
      }
      // Don't modify the error details - pass through the full message
      errorMessage = 'API not enabled'
    } else if (errorDetails.includes('PERMISSION_DENIED') || errorDetails.includes('403')) {
      errorMessage = 'Permission denied'
      errorDetails = 'Unable to access GA property. Please reconnect your Google Analytics account.'
    } else if (errorDetails.includes('NOT_FOUND') || errorDetails.includes('404')) {
      errorMessage = 'Property not found'
      errorDetails = 'The GA4 Property ID could not be found. Please verify the Property ID is correct.'
    } else if (errorDetails.includes('INVALID_ARGUMENT')) {
      errorMessage = 'Invalid credentials'
      errorDetails = 'The OAuth credentials appear to be invalid. Please reconnect your account.'
    } else if (errorDetails.includes('invalid_grant') || errorDetails.includes('Token has been expired')) {
      errorMessage = 'Token expired'
      errorDetails = 'Your Google Analytics connection has expired. Please reconnect your account.'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        projectId, // Include project ID if we extracted it
      },
      { status: 500 }
    )
  }
}
