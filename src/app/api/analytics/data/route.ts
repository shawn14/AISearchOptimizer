import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { getGAOAuthTokens, updateGALastSynced } from '@/lib/firebase/storage'
import { getSession } from '@/lib/auth/session'
import { OAuth2Client } from 'google-auth-library'
import { db, COLLECTIONS } from '@/lib/firebase/config'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session
    const session = await getSession()

    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const userId = session.userId

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    console.log(`Fetching GA data from ${startDate} to ${endDate} for user ${userId}`)

    // Get user's OAuth tokens from database
    const tokens = await getGAOAuthTokens(userId)

    if (!tokens || !tokens.accessToken) {
      return NextResponse.json(
        { error: 'Google Analytics not connected. Please connect first.' },
        { status: 400 }
      )
    }

    // Get property ID
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get()
    const userData = userDoc.data()
    const propertyId = userData?.ga_property_id

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Please select a GA4 property in Settings.' },
        { status: 400 }
      )
    }

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
    const analyticsDataClient = new BetaAnalyticsDataClient({
      authClient: oauth2Client,
    })

    // Fetch user engagement metrics
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [
        { name: 'date' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
    })

    // Fetch top pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    })

    // Process the data
    const trafficTrend = response.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value || '',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
    })) || []

    const topPages = pagesResponse.rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value || 'Unknown',
      url: row.dimensionValues?.[1]?.value || '/',
      pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    })) || []

    // Calculate totals
    const totalUsers = trafficTrend.reduce((sum, day) => sum + day.users, 0)
    const totalSessions = trafficTrend.reduce((sum, day) => sum + day.sessions, 0)
    const totalPageViews = trafficTrend.reduce((sum, day) => sum + day.pageViews, 0)

    // Update last synced timestamp
    await updateGALastSynced(userId)

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalSessions,
          totalPageViews,
          avgSessionDuration: 0, // Can be calculated from raw data
        },
        topPages,
        trafficTrend,
      },
      startDate,
      endDate,
    })

  } catch (error) {
    console.error('Error fetching GA data:', error)

    // Provide more helpful error messages
    let errorMessage = 'Failed to fetch analytics data'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    if (errorDetails.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Please ensure the service account has Viewer access to the GA property.'
      errorDetails = 'Service account needs to be added in GA Admin → Property Access Management with Viewer role. It may take a few minutes for permissions to propagate.'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
