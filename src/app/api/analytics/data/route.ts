import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  let propertyId: string | null = null

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    console.log(`Fetching GA data from ${startDate} to ${endDate}`)

    // Read stored connection info
    const connectionsPath = path.join(process.cwd(), 'data', 'ga-connection.json')

    if (fs.existsSync(connectionsPath)) {
      const connectionData = JSON.parse(fs.readFileSync(connectionsPath, 'utf-8'))
      propertyId = connectionData.propertyId
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Google Analytics not connected. Please connect first.' },
        { status: 400 }
      )
    }

    // Check if credentials file exists
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json')
    if (!fs.existsSync(credentialsPath)) {
      return NextResponse.json(
        { error: 'Google Analytics credentials not found. Please add google-credentials.json to project root.' },
        { status: 400 }
      )
    }

    // Initialize GA Data API client
    const analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: credentialsPath,
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
      errorDetails = `Property ID: ${propertyId}. Service account needs to be added in GA Admin → Property Access Management with Viewer role. It may take a few minutes for permissions to propagate.`
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        propertyId
      },
      { status: 500 }
    )
  }
}
