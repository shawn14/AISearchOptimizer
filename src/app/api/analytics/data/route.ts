import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { getGACredentials, updateGALastSynced } from '@/lib/firebase/storage'
import os from 'os'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  let tempCredentialsPath: string | null = null

  try {
    // Get user ID from session/auth (for now using header)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    console.log(`Fetching GA data from ${startDate} to ${endDate} for user ${userId}`)

    // Get user's GA credentials from database
    const gaData = await getGACredentials(userId)

    if (!gaData) {
      return NextResponse.json(
        { error: 'Google Analytics not connected. Please connect first.' },
        { status: 400 }
      )
    }

    const { propertyId, credentials } = gaData

    // Create temporary credentials file for this request
    // (Google Analytics SDK requires a file path)
    const tempDir = os.tmpdir()
    tempCredentialsPath = path.join(tempDir, `ga-creds-${userId}-${Date.now()}.json`)
    fs.writeFileSync(tempCredentialsPath, JSON.stringify(credentials))

    // Initialize GA Data API client with user's credentials
    const analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: tempCredentialsPath,
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

    // Clean up temp file
    if (tempCredentialsPath && fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath)
      tempCredentialsPath = null
    }

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

    // Clean up temp file on error
    if (tempCredentialsPath && fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath)
    }

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
