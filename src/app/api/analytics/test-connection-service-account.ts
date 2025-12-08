import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getGACredentials } from '@/lib/firebase/storage'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import os from 'os'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  let tempCredentialsPath: string | null = null

  try {
    console.log('=== Starting GA Test Connection ===')
    const session = await getSession()
    console.log('Session:', session ? `User ID: ${session.userId}` : 'No session')

    if (!session?.userId) {
      console.log('ERROR: No session or userId')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's GA credentials
    console.log('Fetching GA credentials for user:', session.userId)
    const gaData = await getGACredentials(session.userId)
    console.log('GA Data retrieved:', gaData ? `Property ID: ${gaData.propertyId}` : 'No GA data')

    if (!gaData) {
      return NextResponse.json(
        { error: 'Google Analytics not connected. Please connect first.' },
        { status: 400 }
      )
    }

    const { propertyId, credentials } = gaData

    // Create temporary credentials file
    const tempDir = os.tmpdir()
    tempCredentialsPath = path.join(tempDir, `ga-test-${session.userId}-${Date.now()}.json`)
    console.log('Writing credentials to temp file:', tempCredentialsPath)
    fs.writeFileSync(tempCredentialsPath, JSON.stringify(credentials))

    // Initialize GA Data API client
    console.log('Initializing GA Data API client...')
    const analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: tempCredentialsPath,
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

    // Clean up temp file
    if (tempCredentialsPath && fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath)
      tempCredentialsPath = null
    }

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
    console.error('=== GA Test Connection Error ===')
    console.error('Full error object:', JSON.stringify(error, null, 2))
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A')
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Error code:', (error as any).code)
    }
    console.error('================================')

    // Clean up temp file on error
    if (tempCredentialsPath && fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath)
    }

    // Provide helpful error messages
    let errorMessage = 'Connection test failed'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    if (errorDetails.includes('PERMISSION_DENIED') || errorDetails.includes('403')) {
      errorMessage = 'Permission denied'
      errorDetails = 'The service account does not have access to this GA property. Please add the service account email as a Viewer in Google Analytics → Admin → Property Access Management.'
    } else if (errorDetails.includes('NOT_FOUND') || errorDetails.includes('404')) {
      errorMessage = 'Property not found'
      errorDetails = 'The GA4 Property ID could not be found. Please verify the Property ID is correct.'
    } else if (errorDetails.includes('INVALID_ARGUMENT')) {
      errorMessage = 'Invalid credentials'
      errorDetails = 'The service account credentials appear to be invalid. Please re-download the JSON key file.'
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
